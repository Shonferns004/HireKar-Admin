import React, { useEffect, useState } from "react";
import {
  Plus,
  MagicWand,
  BookOpen,
  Lightning,
  Trash,
  Download,
  X,
  CaretRight,
  GraduationCap,
  CalendarBlank,
  Clock,
  VideoCamera,
  ChartBar,
  ListNumbers,
  TextAlignLeft,
  Tag,
} from "phosphor-react";
import Groq from "groq-sdk";
import { supabase } from "../config/supabase";
import { useNavigate } from "react-router-dom";
import { generateImage } from "../utils/image";

const PROMPT = `
Generate a learning course based on the following details.

Rules:
- The number of items in "chapters" MUST equal "noOfChapters"
- Respond ONLY with valid JSON
- Do NOT include explanations or extra text

Schema:
{
  "course": {
    "name": "string",
    "description": "string",
    "category": "string",
    "level": "Beginner | Intermediate | Advanced",
    "includeVideo": boolean,
    "noOfChapters": number,
    "bannerImagePrompt": "string",
    "chapters": [
      {
        "chapterName": "string",
        "duration": "string",
        "topics": [
          "string"
        ],
        "imagePrompt": "string"
      }
    ]
  }
}

User Input:
`;

const CATEGORIES = [
  "Engineering",
  "Design",
  "Marketing",
  "Human Resources",
  "Product Management",
  "Business Strategy",
  "Data Science",
  "Soft Skills",
];
const buildFormPayload = ({
  courseName,
  category,
  description,
  numChapters,
  includeVideo,
  difficulty,
}) => ({
  name: courseName,
  description,
  category,
  level: difficulty,
  includeVideo,
  noOfChapters: numChapters,
});

export const AITools = () => {
  // Form State
  const [courseName, setCourseName] = useState("");

  const [category, setCategory] = useState("Engineering");
  const [description, setDescription] = useState("");
  const [numChapters, setNumChapters] = useState(5);
  const [includeVideo, setIncludeVideo] = useState(false);
  const [difficulty, setDifficulty] = useState("Intermediate");

  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreator, setShowCreator] = useState(false);
  const [generatedCourses, setGeneratedCourses] = useState([]);
  const [activeCourse, setActiveCourse] = useState(null);
  const navigate = useNavigate();
  const courseId = crypto.randomUUID()


  // const ImagePrompt = JSONRESPONSE.name?.chapters[0].imagePrompt

  const payload = buildFormPayload({
    courseName,
    category,
    description,
    numChapters,
    includeVideo,
    difficulty,
  });

  const fetchCoursesFromDB = async () => {
    try {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mappedCourses = data.map((course) => ({
        id: course.id,
        topic: course.name,
        category: course.category,
        description: course.description,
        outline: JSON.stringify(course.course_json?.chapters || [], null, 2),
        date: new Date(course.created_at).toLocaleDateString(),
        status: course.status,
        duration: `${course.chapters} Chapters`,
        difficulty: course.level,
        chapters: course.chapters,
        hasVideo: course.include_video,
      }));

      setGeneratedCourses(mappedCourses);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  };

  useEffect(() => {
    fetchCoursesFromDB();
  }, []);

  const generateCourse = async () => {
    if (!courseName.trim()) return;

    setIsGenerating(true);

    try {
      if (!import.meta.env.VITE_GROQ_API_KEY) {
        throw new Error("Groq API key missing");
      }

      console.log(payload);

      const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true, // REQUIRED
      });

      const completion = await groq.chat.completions.create({
        model: "openai/gpt-oss-120b",
        messages: [
          {
            role: "user",
            content: PROMPT + JSON.stringify(payload),
          },
        ],
        temperature: 0.4,
      });

      const rawText = completion.choices[0]?.message?.content;
      console.log(completion);

      if (!rawText) {
        throw new Error("AI returned empty response");
      }

      // ---- Parse JSON safely ----
      let parsed;
      try {
        parsed = JSON.parse(rawText);
      } catch {
        console.error("RAW AI OUTPUT:", rawText);
        throw new Error("Invalid JSON returned by AI");
      }

      const ImagePromt = parsed.course.bannerImagePrompt;
      console.log(ImagePromt);

      const bannerURL = await generateImage(ImagePromt);

      const course = parsed.course;

      if (
        !course ||
        !Array.isArray(course.chapters) ||
        course.chapters.length !== course.noOfChapters
      ) {
        throw new Error("Generated course schema is invalid");
      }


      // ---- Insert into Supabase ----
      const { data, error } = await supabase
        .from("courses")
        .insert({
          cid: courseId,
          name: course.name,
          category: course.category,
          description: course.description,
          chapters: course.noOfChapters,
          level: course.level,
          include_video: course.includeVideo,
          course_json: course,
          bannerurl: bannerURL,
          status: "Published",
        })
        .select()
        .single();

      if (error) throw error;

      await fetchCoursesFromDB();
      resetForm();
      setShowCreator(false);
      navigate(`/course-detials/${courseId}`);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate course");
    } finally {
      setIsGenerating(false);
    }
  };

  const resetForm = () => {
    setCourseName("");
    setCategory("Engineering");
    setDescription("");
    setNumChapters(5);
    setIncludeVideo(false);
    setDifficulty("Intermediate");
  };

  const deleteCourse = (id) => {
    setGeneratedCourses((prev) => prev.filter((c) => c.id !== id));
    if (activeCourse?.id === id) setActiveCourse(null);
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 bg-slate-50 min-h-screen animate-in fade-in duration-700">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-primary font-black uppercase text-[10px] tracking-[0.2em]">
            <GraduationCap weight="fill" />
            E-Learning Academy
          </div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900">
            Course Management
          </h2>
          <p className="text-slate-500 font-medium">
            Design and deploy AI-architected curriculums.
          </p>
        </div>

        <button
          onClick={() => setShowCreator(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-primary px-8 py-4 text-sm font-black text-white shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95"
        >
          <Plus size={20} weight="bold" />
          <span>Create New Course</span>
        </button>
      </div>

      {/* Compact Course Creation Modal */}
      {showCreator && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300"
            onClick={() => !isGenerating && setShowCreator(false)}
          />
          <div className="relative bg-white w-full max-w-lg rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-400 max-h-[90vh] flex flex-col">
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-primary overflow-hidden ${isGenerating ? "block" : "hidden"}`}
            >
              <div
                className="h-full bg-white/30 animate-[loading_2s_infinite_linear]"
                style={{ width: "30%", transform: "translateX(-100%)" }}
              ></div>
            </div>

            <div className="p-6 border-b border-slate-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <MagicWand size={20} weight="bold" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight">
                    Create New Course
                  </h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    AI Architect v3
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowCreator(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-all"
                disabled={isGenerating}
              >
                <X size={18} weight="bold" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <div className="grid grid-cols-1 gap-5">
                {/* Course Name */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    <BookOpen size={12} weight="bold" /> Course Title
                  </label>
                  <input
                    type="text"
                    value={courseName}
                    onChange={(e) => setCourseName(e.target.value)}
                    placeholder="e.g. Master Class: Branding Design"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900 bg-slate-50/30 text-sm"
                  />
                </div>

                {/* Category Selection */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    <Tag size={12} weight="bold" /> Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900 bg-slate-50/30 text-sm appearance-none"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                    <TextAlignLeft size={12} weight="bold" /> Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief overview of the course goals..."
                    rows={2}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900 bg-slate-50/30 text-sm resize-none"
                  />
                </div>

                {/* Row: Chapters & Difficulty */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      <ListNumbers size={12} weight="bold" /> Chapters
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={15}
                      value={numChapters}
                      onChange={(e) => setNumChapters(parseInt(e.target.value))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900 bg-slate-50/30 text-sm"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">
                      <ChartBar size={12} weight="bold" /> Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-bold text-slate-900 bg-slate-50/30 text-sm appearance-none"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>
                </div>

                {/* Video Toggle - Compact Row */}
                <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50/80 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <VideoCamera
                      size={16}
                      className={
                        includeVideo ? "text-primary" : "text-slate-400"
                      }
                      weight="bold"
                    />
                    <span className="text-xs font-black text-slate-700">
                      Include Video Scripts
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIncludeVideo(!includeVideo)}
                    className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none ${includeVideo ? "bg-primary" : "bg-slate-300"}`}
                  >
                    <span
                      className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${includeVideo ? "translate-x-5" : "translate-x-0.5"}`}
                    />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/30 flex flex-col gap-3 shrink-0">
              <button
                onClick={generateCourse}
                disabled={isGenerating || !courseName}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-black py-3.5 rounded-xl shadow-lg hover:bg-slate-800 transition-all transform active:scale-[0.98] disabled:opacity-50 text-sm"
              >
                {isGenerating ? (
                  <>
                    <div className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span>Architecting...</span>
                  </>
                ) : (
                  <>
                    <Lightning size={16} weight="fill" />
                    <span>Generate Curriculum</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {generatedCourses.map((course) => (
          <div
            key={course.id}
            onClick={() => navigate(`/course-details/${course.id}`)}
            className="group bg-white rounded-[2rem] p-8 border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer relative overflow-hidden flex flex-col h-full"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="size-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                <BookOpen size={24} weight="bold" />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteCourse(course.id);
                  }}
                  className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash size={16} weight="bold" />
                </button>
              </div>
            </div>

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-widest border border-slate-200">
                  {course.category}
                </span>
                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                  {course.date}
                </span>
              </div>
              <h3 className="text-lg font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">
                {course.topic}
              </h3>
              <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed">
                {course.description || course.outline}
              </p>
            </div>

            <div className="mt-6 pt-5 border-t border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1 text-slate-400">
                  <ChartBar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-tight">
                    {course.difficulty}
                  </span>
                </div>
                {course.hasVideo && (
                  <div className="flex items-center gap-1 text-slate-400">
                    <VideoCamera size={14} />
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      Video
                    </span>
                  </div>
                )}
              </div>
              <CaretRight
                size={18}
                className="text-slate-300 group-hover:text-primary group-hover:translate-x-1 transition-all"
                weight="bold"
              />
            </div>
          </div>
        ))}
      </div>

      {generatedCourses.length === 0 && !showCreator && (
        <div className="py-20 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
          <div className="size-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6">
            <BookOpen size={40} className="text-slate-200" />
          </div>
          <h3 className="text-2xl font-black text-slate-900 mb-2">
            No Courses Architected
          </h3>
          <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mb-8">
            Start your first curriculum today
          </p>
          <button
            onClick={() => setShowCreator(true)}
            className="inline-flex items-center gap-2 px-8 py-4 bg-slate-900 text-white font-black rounded-2xl hover:scale-105 transition-all active:scale-95"
          >
            <Plus weight="bold" /> New Project
          </button>
        </div>
      )}

      {/* Course Detail Modal */}
      {activeCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8">
          <div
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
            onClick={() => setActiveCourse(null)}
          />
          <div className="relative bg-white w-full max-w-4xl max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-400">
            <div className="p-8 sm:p-12 border-b border-slate-100 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-6">
                <div className="size-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary">
                  <BookOpen size={32} weight="bold" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-slate-900 leading-tight">
                    {activeCourse.topic}
                  </h2>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Tag weight="bold" /> {activeCourse.category}
                    </span>
                    <span className="size-1 rounded-full bg-slate-300"></span>
                    <span className="text-xs font-black text-primary uppercase tracking-widest">
                      {activeCourse.difficulty} • {activeCourse.chapters}{" "}
                      Chapters
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 rounded-2xl text-sm font-black text-slate-700 transition-all">
                  <Download weight="bold" /> Export
                </button>
                <button
                  onClick={() => setActiveCourse(null)}
                  className="p-3 text-slate-400 hover:text-slate-900 rounded-2xl bg-slate-50 transition-all"
                >
                  <X size={24} weight="bold" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 sm:p-12">
              <div className="prose prose-slate max-w-none">
                <h3 className="text-xl font-black text-slate-900 mb-6 uppercase tracking-widest">
                  Architected Curriculum
                </h3>
                <div className="whitespace-pre-wrap font-medium text-slate-600 leading-relaxed text-lg bg-slate-50 p-8 rounded-[2rem] border border-slate-100 shadow-inner">
                  {activeCourse.outline}
                </div>
              </div>

              <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-[2rem] bg-indigo-50 border border-indigo-100">
                  <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <VideoCamera weight="bold" /> Media Assets
                  </h4>
                  <p className="text-sm font-bold text-slate-800">
                    {activeCourse.hasVideo
                      ? "Dynamic video scripts generated for all chapters."
                      : "Static asset package compiled."}
                  </p>
                </div>
                <div className="p-6 rounded-[2rem] bg-emerald-50 border border-emerald-100">
                  <h4 className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <ChartBar weight="bold" /> Assessment
                  </h4>
                  <p className="text-sm font-bold text-slate-800">
                    Adaptive testing logic configured for{" "}
                    {activeCourse.difficulty} level.
                  </p>
                </div>
                <div className="p-6 rounded-[2rem] bg-amber-50 border border-amber-100">
                  <h4 className="text-xs font-black text-amber-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Clock weight="bold" /> Estimated Effort
                  </h4>
                  <p className="text-sm font-bold text-slate-800">
                    Approx. {activeCourse.duration} of concentrated study
                    required.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-green-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Architected via Gemini Intelligence Engine v3
                </p>
              </div>
              <button className="w-full sm:w-auto px-10 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary-dark transition-all transform active:scale-95">
                Deploy to LMS
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(400%); }
        }
      `}</style>
    </div>
  );
};
