import mongoose from 'mongoose';
import dotenv from 'dotenv';
import axios from 'axios';
import Test from '../models/testModel.js';
import CodingQuestion from '../models/CodingQuestion.js';

dotenv.config();
const { MONGO_URI } = process.env;

const randomPastDate = (maxDaysBack = 30) => {
  const now = Date.now();
  const days = Math.floor(Math.random() * (maxDaysBack + 1));
  const hours = Math.floor(Math.random() * 24);
  return new Date(now - (days * 24 + hours) * 60 * 60 * 1000);
};

const starterSnippets = {
  javascript: `function solve(input){\n  // TODO: implement\n  return input;\n}\nmodule.exports = solve;`,
  python: `def solve(input):\n    # TODO: implement\n    return input`,
  java: `public class Solution {\n  public static String solve(String input){\n    // TODO: implement\n    return input;\n  }\n}`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\nstring solve(string input){\n  // TODO: implement\n  return input;\n}`,
};

const languages = ['javascript','python','java','cpp'];

const makeCodingQuestions = (testId, count = 3) => {
  return Array.from({ length: count }).map((_, i) => {
    const lang = languages[i % languages.length];
    return {
      testId,
      title: `Coding Problem #${i + 1}`,
      description: `Write a function that echoes the input for problem ${i + 1}.` ,
      difficulty: ['easy','medium','hard'][i % 3],
      language: lang,
      starterCode: starterSnippets[lang],
      testCases: [
        { input: 'hello', expectedOutput: 'hello' },
        { input: 'world', expectedOutput: 'world' }
      ],
      marks: 5
    };
  });
};

const seed = async () => {
  const AUTH_SERVICE_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:8001';
  await mongoose.connect(MONGO_URI || 'mongodb://127.0.0.1:27017/evolveai_teacher');

  // fetch subjects to derive courses
  const { data: subjects } = await axios.get(`${AUTH_SERVICE_URL}/subjects`);
  const courseList = (subjects || []).map((s) => (s?.code || s?.name || 'GEN').toString().toLowerCase());
  const courses = courseList.length > 0 ? courseList : ['cs101','cs201','cs301'];

  // clean previous coding tests and coding questions
  await CodingQuestion.deleteMany({});
  await Test.deleteMany({ type: 'CODING' });

  const tests = Array.from({ length: 15 }).map((_, i) => {
    const start = randomPastDate(30);
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);
    return {
      title: `Auto Coding Test #${i + 1}`,
      type: 'CODING',
      createdBy: '5ccbbfc1-6363-4ee2-9fa0-272a1885c317',
      course: courses[i % courses.length],
      scheduledAt: start,
      expiresAt: end,
      totalMarks: 15,
      isPublished: true,
    };
  });

  const createdTests = await Test.insertMany(tests);

  const allQuestions = createdTests.flatMap((test) => makeCodingQuestions(test._id, 3));
  await CodingQuestion.insertMany(allQuestions);

  console.log(`✅ Inserted ${createdTests.length} coding tests and ${allQuestions.length} coding questions.`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Coding seed failed:', err);
  process.exit(1);
});
