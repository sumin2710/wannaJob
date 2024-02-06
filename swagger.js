const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'wanna-job',
      version: '1.0.0',
      description: 'job resumes website',
    },
    servers: [
      {
        url: 'http://localhost:3032', //'http://13.211.141.94:3032', 
      },
    ],
  },
  apis: ['./routers/*.js'], // Path to the API docs
};

export default options;
