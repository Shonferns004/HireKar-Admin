import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Play,
  CheckCircle,
  Lock,
  MonitorPlay,
  GraduationCap,
  Clock,
  ListNumbers,
  ChartBar,
} from "phosphor-react";
import { supabase } from "../config/supabase";
import axios from 'axios'
import api from "../utils/api";
import { calculateTotalDuration } from "../lib/duration";

const CourseDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;

    const fetchCourse = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        console.error(error);
        setError("Failed to load course");
        setLoading(false);
        return;
      }

      // 🔒 UI-SAFE DATA NORMALIZATION (DO NOT TOUCH JSX)
      const normalizedCourse = {
        ...data,

        // UI aliases
        topic: data.name,
        date: new Date(data.created_at).toLocaleDateString(),
        duration:calculateTotalDuration(data.course_json?.chapters),
        chaptersCount: data.chapters,
        difficulty: data.level,

        // Timeline structure from AI JSON
        chaptersData:
          data.course_json?.chapters?.map((chapter) => ({
            title: chapter.chapterName,
            icon: "📘",
            lessons: chapter.topics.map((topic) => ({
              title: topic,
              description: `Learn about ${topic}`,
              status: "Locked", // future: Finished | Current | Locked
            })),
          })) || [],
      };

      setCourse(normalizedCourse);
      setLoading(false);
    };

    fetchCourse();
  }, [id]);

  // ---------- UI STATES (ORDER FIXED) ----------
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin size-12 border-4 border-slate-200 border-t-primary rounded-full"></div>
      </div>
    );
  }


  const generateContent = async()=>{
    //call api to generate content
    if (!course?.course_json?.chapters?.length) {
console.error("Course JSON not ready");
return;

}
    try {
      setLoading(true)

      const result = await api.post('/generate-video', {
        courseJson:course?.course_json,
        courseTitle:course?.name,
        courseId: course?.cid
      })
      console.log(result.data)
      setLoading(false)
      navigate('/courses')
    } catch (error) {
      console.log(error)
      setLoading(false)

    }
  }

  if (error) return <div>{error}</div>;
  if (!course) return <div>Course not found</div>;

  return (
    <div className="p-4 sm:p-8 bg-[#F6F7F8] min-h-screen animate-in fade-in duration-500">
      <div className="space-y-8">
        <button
          onClick={() => navigate("/courses")}
          className="flex items-center gap-2 text-slate-400 hover:text-slate-900 font-bold transition-colors group"
        >
          <div className="size-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:bg-slate-50 transition-all">
            <ArrowLeft size={18} weight="bold" />
          </div>
          <span>Back</span>
        </button>

        <div className="relative overflow-hidden border border-slate-100">
          {/* Top Section */}
          <div className="p-8 sm:p-12 border-b border-slate-100 flex flex-col lg:flex-row gap-10 items-center">
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] border border-slate-200">
                  {course.category}
                </span>
                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                  {course.date}
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-tight tracking-tight">
                {course.topic}
              </h1>

              <p className="text-slate-500 font-medium text-lg leading-relaxed max-w-2xl">
                {course.description}
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <div className="flex items-center gap-3 bg-blue-50/50 border border-blue-100 px-5 py-3 rounded-2xl">
                  <div className="size-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                    <Clock size={16} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest leading-none">
                      Duration
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {course.duration}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-green-50/50 border border-green-100 px-5 py-3 rounded-2xl">
                  <div className="size-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <ListNumbers size={16} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-green-500 uppercase tracking-widest leading-none">
                      Chapters
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {course.chaptersCount} Chapters
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-orange-50/50 border border-orange-100 px-5 py-3 rounded-2xl">
                  <div className="size-8 rounded-full bg-orange-500 flex items-center justify-center text-white">
                    <ChartBar size={16} weight="bold" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-orange-500 uppercase tracking-widest leading-none">
                      Difficulty
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {course.difficulty} 🔥
                    </p>
                  </div>
                </div>
              </div>

              {course.course_content == null && (
  <div className="pt-4">
    <button
      onClick={generateContent}
      className="inline-flex items-center gap-3 bg-[#6366F1] text-white px-10 py-4 rounded-[1.2rem] font-black shadow-lg shadow-indigo-200 hover:scale-[1.02] active:scale-95 transition-all"
    >
      <Play size={20} weight="fill" />
      Start Learning
    </button>
  </div>
)}

            </div>

            {/* Thumbnail (unchanged) */}
            <div className="w-full lg:w-[320px] shrink-0">
              <div
  className="aspect-[4/3] rounded-[2rem] relative overflow-hidden flex items-center justify-center group shadow-2xl"
  style={{
    backgroundImage: `url(${course.bannerurl})`,
    backgroundSize: "cover",
    backgroundPosition: "center",
  }}
>

              </div>
            </div>
          </div>

          {/* Timeline */}
          <div className="p-8 sm:p-16 w-full">
            <h3 className="text-2xl font-black text-slate-900 text-center mb-12">
              Your Learning Journey 🚀
            </h3>

            <div className="space-y-12">
              {course.chaptersData.map((chapter, cIndex) => (
                <div key={cIndex} className="space-y-4">
                  <h4 className="text-xl font-black">
                    {cIndex + 1}. {chapter.title}
                  </h4>

                  {chapter.lessons.map((lesson, lIndex) => (
                    <div
                      key={lIndex}
                      className="flex items-center gap-4 p-5 bg-white border border-slate-200 rounded-xl"
                    >
                      <Lock size={20} className="text-slate-400" />
                      <div>
                        <p className="font-bold">{lesson.title}</p>
                        <p className="text-sm text-slate-500">
                          {lesson.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div className="p-10 border-t border-slate-100 bg-slate-50 flex justify-center">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
              <GraduationCap weight="bold" /> 100% Guaranteed Success Path
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};


export default CourseDetails