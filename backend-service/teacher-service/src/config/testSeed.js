import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Test from '../models/testModel.js';
import Question from '../models/MCQquestion.js';
import axios from 'axios';

dotenv.config();
const { MONGO_URI } = process.env;

const randomPastDate = (maxDaysBack = 30) => {
  const now = Date.now();
  const days = Math.floor(Math.random() * (maxDaysBack + 1));
  const hours = Math.floor(Math.random() * 24);
  return new Date(now - (days * 24 + hours) * 60 * 60 * 1000);
};

// courses will be derived from subjects fetched from auth-service

const generateOptions = (opts) => opts.map((text, index) => ({ id: `opt${index + 1}`, text }));
const getCorrectOptionId = (options, correctText) => options.find((o) => o.text === correctText)?.id;

const seed = async () => {
  await mongoose.connect(MONGO_URI || 'mongodb://127.0.0.1:27017/evolveai_teacher');

  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
  const { data: subjects } = await axios.get(`${AUTH_SERVICE_URL}/subjects`);
  const courseList = (subjects || []).map((s) => (s?.code || s?.name || 'GEN').toString().toLowerCase());
  const courses = courseList.length > 0 ? courseList : ['cs101','cs201','cs301'];

  await Test.deleteMany();
  await Question.deleteMany();

  const tests = Array.from({ length: 15 }).map((_, i) => {
    const start = randomPastDate(30);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return {
      title: `Auto Test #${i + 1}`,
      type: 'MCQ',
      createdBy: '5ccbbfc1-6363-4ee2-9fa0-272a1885c317',
      course: courses[i % courses.length],
      scheduledAt: start,
      expiresAt: end,
      totalMarks: 5,
      isPublished: true,
    };
  });

  const createdTests = await Test.insertMany(tests);

  const questions = createdTests.flatMap((test) => {
    return Array.from({ length: 5 }).map((__, qi) => {
      const optsTexts = ['A', 'B', 'C', 'D'].map((c) => `${c} option for Q${qi + 1}`);
      const options = generateOptions(optsTexts);
      const correctOptionId = options[qi % options.length].id;
      return {
        testId: test._id,
        questionText: `Auto question ${qi + 1} for ${test.title}`,
        options,
        correctOptionId,
        marks: 1,
      };
    });
  });

  await Question.insertMany(questions);
  console.log(`✅ Inserted ${createdTests.length} tests and ${questions.length} questions.`);
  process.exit();
};

seed();
