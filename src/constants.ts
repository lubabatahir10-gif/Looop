/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Tone, ThemeMode, ColorTheme } from './types';

export const SALUTATIONS = ['Sir', 'Ma’am', 'Miss', 'Mrs.', 'Mr.', 'Professor', 'Custom'];
export const TONES: Tone[] = ['Professional', 'Friendly', 'Gen Z'];
export const INTENSITIES = ['Low', 'Medium', 'High'];
export const THEME_MODES: ThemeMode[] = ['light', 'dark', 'system'];
export const COLOR_THEMES: ColorTheme[] = ['Classic', 'Muted Blue', 'Soft Sage', 'Dusty Rose', 'Minimal Slate'];

export const TASK_TEMPLATES = [
  { title: "Write Planner", icon: "📓" },
  { title: "Collect from photocopier", icon: "📄" },
  { title: "Submitting reports", icon: "📤" },
  { title: "Cutting vocabulary words", icon: "✂️" },
  { title: "Making AV aids", icon: "🎬" },
  { title: "Finding missing materials", icon: "🔍" },
];

export const NAG_MESSAGES: Record<Tone, { tasks: string[]; notebooks: string[]; general: string[] }> = {
  Professional: {
    tasks: [
      "Hello {name}, just keeping you in the loop! You have some tasks to complete. ✨",
      "Pardon me, {name}. Your professional productivity list is waiting for a check! ✅",
      "Efficiency looks great on you, {name}! Let's close those pending tasks."
    ],
    notebooks: [
      "The grading pile is calling, {name}! Let's stay in the loop and finish those notebooks. 📚",
      "System update: Some class sections are still waiting for your expertise, {name}!",
      "A quick professional nudge: 11 Grade Awesome (and others) are waiting to be checked! 🎀"
    ],
    general: [
      "Success is a loop of small efforts, {name}. Keep going! 🍭",
      "Stay focused and stay cute, {name}! You're doing amazing."
    ]
  },
  Friendly: {
    tasks: [
      "Hi hi {name}! 🌸 Don't forget your little tasks! You're doing so well!",
      "Nudge nudge! {name}, those to-dos are missing your sparkle! ✨",
      "Time to check some boxes, {name}! I believe in you, superstar! 🌟"
    ],
    notebooks: [
      "Those notebooks are feeling lonely, {name}! 📚 Let's give them some love!",
      "Ready for a grading party, {name}? Your students are so excited! 🎈",
      "Just a tiny reminder that those piles are waiting for your magic touch! 🪄"
    ],
    general: [
      "Take a deep breath and a sip of tea, {name}. You've got this! 🍵",
      "You're the best teacher ever, {name}! Stay in the loop! 🍬"
    ]
  },
  'Gen Z': {
    tasks: [
      "This task is side-eyeing you 👀",
      "These tasks are still pending. Be honest, are we doing this? 👀",
      "Just 2 mins? Let’s go. ✨",
      "You forgot again, didn’t you? 👀"
    ],
    notebooks: [
      "The grading pile stands no chance once you lock in. Still pending though! 👀",
      "Are those notebooks okay? They're literally waiting for you.",
      "Just a quick check-in: these sections are still side-eyeing you. 👀"
    ],
    general: [
      "Manifesting a productive session for you. ✨",
      "Stay iconic, but maybe finish one thing? 👀"
    ]
  }
};
