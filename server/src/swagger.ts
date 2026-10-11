import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'MahaVote API — Maharashtra Election Management Portal',
      version: '1.0.0',
      description:
        'RESTful API for the MahaVote Demonstration Platform. Features simulated voter registration, OTP verification, nomination lifecycle, privacy-preserving ballot casting, and administrative election oversight.\n\n**DISCLAIMER**: Educational Demonstration Platform — Not an Official Election Commission of India or State Election Commission service.',
      contact: {
        name: 'MahaVote Educational Technical Cell',
        email: 'tech-demo@mahavote.internal',
      },
    },
    servers: [
      {
        url: 'http://localhost:5000/api',
        description: 'Local Development Server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token.',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    paths: {
      '/auth/login': {
        post: {
          summary: 'User Login',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    identifier: { type: 'string', example: 'voter1@mahavote.demo' },
                    password: { type: 'string', example: 'Voter@12345' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Successful login with JWT tokens' },
            401: { description: 'Invalid credentials' },
          },
        },
      },
      '/auth/otp/request': {
        post: {
          summary: 'Request Demo OTP',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    identifier: { type: 'string', example: '9876543210' },
                    purpose: { type: 'string', example: 'LOGIN' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'OTP generated and delivered to simulator' },
          },
        },
      },
      '/auth/otp/simulator-inbox': {
        get: {
          summary: 'Inspect active OTPs in development simulator',
          tags: ['Authentication'],
          responses: {
            200: { description: 'Active simulator OTPs list' },
          },
        },
      },
      '/elections': {
        get: {
          summary: 'List Elections',
          tags: ['Elections'],
          parameters: [
            { name: 'districtId', in: 'query', schema: { type: 'string' } },
            { name: 'status', in: 'query', schema: { type: 'string' } },
            { name: 'electionType', in: 'query', schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'List of demo elections' },
          },
        },
      },
      '/ballot/election/{electionId}': {
        get: {
          summary: 'Retrieve ballot and check voter eligibility',
          tags: ['Ballot & Privacy Voting'],
          parameters: [
            { name: 'electionId', in: 'path', required: true, schema: { type: 'string' } },
          ],
          responses: {
            200: { description: 'Ballot data with candidate list and NOTA' },
            400: { description: 'Already voted or election inactive' },
          },
        },
      },
      '/ballot/vote': {
        post: {
          summary: 'Cast simulated vote with privacy separation',
          tags: ['Ballot & Privacy Voting'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    electionId: { type: 'string' },
                    candidateId: { type: 'string', nullable: true },
                    isNota: { type: 'boolean' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Vote successfully cast. Receipt returned without candidate choice.' },
            409: { description: 'Duplicate vote blocked' },
          },
        },
      },
      '/ballot/receipt/verify/{receiptNumber}': {
        get: {
          summary: 'Verify authenticity of digital vote receipt',
          tags: ['Ballot & Privacy Voting'],
          parameters: [
            { name: 'receiptNumber', in: 'path', required: true, schema: { type: 'string', example: 'MV-2026-ABCD-1234' } },
          ],
          responses: {
            200: { description: 'Receipt verification record' },
            404: { description: 'Receipt not found' },
          },
        },
      },
      '/admin/metrics': {
        get: {
          summary: 'Get system analytics and turnout monitoring metrics',
          tags: ['Administration'],
          responses: {
            200: { description: 'Admin statistics and dashboard charts data' },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
