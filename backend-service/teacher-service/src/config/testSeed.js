import mongoose from 'mongoose';
import Test from '../models/testModel.js';
import Question from '../models/MCQquestion.js';

await mongoose.connect('mongodb://127.0.0.1:27017/evolveai_teacher'); // change if needed

const seed = async () => {
  await Test.deleteMany();
  await Question.deleteMany();

  const tests = [
    {
      title: 'JavaScript Basics Test',
      type: 'MCQ',
      createdBy: '5ccbbfc1-6363-4ee2-9fa0-272a1885c317', // from Postgres
      course: 'cs301',
      scheduledAt: new Date(Date.now() + 3600000),
      expiresAt: new Date(Date.now() + 7200000),
      totalMarks: 5,
      isPublished: true,
    },
    {
      title: 'HTML + CSS Quiz',
      type: 'MCQ',
      createdBy: '5ccbbfc1-6363-4ee2-9fa0-272a1885c317',
      course: 'cs201',
      scheduledAt: new Date(Date.now() + 3600000),
      expiresAt: new Date(Date.now() + 7200000),
      totalMarks: 5,
      isPublished: true,
    }
  ];

  const createdTests = await Test.insertMany(tests);

  const generateOptions = (opts) =>
    opts.map((text, index) => ({
      id: `opt${index + 1}`,
      text,
    }));

  const getCorrectOptionId = (options, correctText) => {
    const option = options.find((o) => o.text === correctText);
    return option?.id;
  };

  const rawQuestions = [
    // JS Test
    {
      testIndex: 0,
      questionText: 'What does "typeof null" return?',
      options: ['object', 'null', 'undefined', 'function'],
      correct: 'object',
    },
    {
      testIndex: 0,
      questionText: 'Which method converts JSON to JavaScript object?',
      options: ['JSON.stringify()', 'JSON.parse()', 'JSON.convert()', 'parse.JSON()'],
      correct: 'JSON.parse()',
    },
    {
      testIndex: 0,
      questionText: 'Which is NOT a JavaScript data type?',
      options: ['String', 'Boolean', 'Float', 'Undefined'],
      correct: 'Float',
    },
    {
      testIndex: 0,
      questionText: 'Which keyword declares a constant in JavaScript?',
      options: ['const', 'let', 'var', 'constant'],
      correct: 'const',
    },
    {
      testIndex: 0,
      questionText: 'How do you write a comment in JavaScript?',
      options: ['# comment', '// comment', '<!-- comment -->', '** comment **'],
      correct: '// comment',
    },

    // HTML + CSS Test
    {
      testIndex: 1,
      questionText: 'Which tag is used to define an internal style sheet?',
      options: ['<style>', '<css>', '<script>', '<link>'],
      correct: '<style>',
    },
    {
      testIndex: 1,
      questionText: 'Which property changes the text color in CSS?',
      options: ['color', 'text-color', 'font-color', 'style'],
      correct: 'color',
    },
    {
      testIndex: 1,
      questionText: 'What does HTML stand for?',
      options: [
        'Hyperlinks and Text Markup Language',
        'Hyper Text Markup Language',
        'Home Tool Markup Language',
        'Hyperlink Tool Markup Language',
      ],
      correct: 'Hyper Text Markup Language',
    },
    {
      testIndex: 1,
      questionText: 'Which tag is used to display images?',
      options: ['<img>', '<image>', '<src>', '<pic>'],
      correct: '<img>',
    },
    {
      testIndex: 1,
      questionText: 'Which HTML attribute is used to define inline styles?',
      options: ['class', 'style', 'font', 'id'],
      correct: 'style',
    },
  ];

  const formattedQuestions = rawQuestions.map((q) => {
    const opts = generateOptions(q.options);
    return {
      testId: createdTests[q.testIndex]._id,
      questionText: q.questionText,
      options: opts,
      correctOptionId: getCorrectOptionId(opts, q.correct),
      marks: 1,
    };
  });

  await Question.insertMany(formattedQuestions);

  console.log('✅ Seed data inserted successfully');
  process.exit();
};

seed();
