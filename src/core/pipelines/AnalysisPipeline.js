export class AnalysisPipeline {
  constructor() {
    this.stages = [];
  }

  addStage(name, stageFn) {
    this.stages.push({ name, execute: stageFn });
    return this;
  }

  execute(transcript, protocol, inputs = {}) {
    const context = {
      transcript,
      protocol,
      inputs,
      results: {},
      logs: [],
    };

    this.stages.forEach((stage) => {
      const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
      try {
        stage.execute(context);
        const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
        const duration = (endTime - startTime).toFixed(2);
        context.logs.push({
          stageName: stage.name,
          status: 'SUCCESS',
          message: `Stage '${stage.name}' processed successfully.`,
          duration: `${duration}ms`,
        });
      } catch (err) {
        context.logs.push({
          stageName: stage.name,
          status: 'ERROR',
          message: `Stage '${stage.name}' failed: ${err.message}`,
          duration: '0.00ms',
        });
      }
    });

    return {
      results: context.results,
      logs: context.logs,
    };
  }
}
