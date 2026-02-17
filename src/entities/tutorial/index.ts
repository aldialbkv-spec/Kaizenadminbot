/**
 * Public API для сущности туториалов
 */
export type { Tutorial, UserVideoProgress, TutorialWithProgress } from './model/types';
export { getTutorials, getVideoUrl, updateVideoProgress, markAsWatched } from './api/tutorialApi';
