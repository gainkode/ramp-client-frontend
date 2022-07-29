import { isSumsubVerificationComplete } from "./utils";

describe('isSumsubVerificationComplete', () => {
  it('should return success', () => {
    const payload = {
        reviewId: 'CbJqo',
        attemptId: 'hHMMr',
        attemptCnt: 7,
        elapsedSincePendingMs: 14980,
        elapsedSinceQueuedMs: 44389,
        reprocessing: true,
        levelName: 'Identity-verification',
        createDate: '2022-07-29 11:45:51+0000',
        reviewDate: '2022-07-29 11:46:06+0000',
        reviewResult: {
            reviewAnswer: 'GREEN'
        },
        reviewStatus: 'completed',
        priority: 0,
        moderatorNames: null,
        autoChecked: false
    }
    const result = isSumsubVerificationComplete(payload);
    expect(result).toBeTruthy();
  });
});
