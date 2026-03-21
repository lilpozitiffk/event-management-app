export const agentTools = [
  {
    type: 'function' as const,
    function: {
      name: 'getUserEvents',
      description:
        'Get events where the current user is a participant or organizer. Returns event title, date, time, location, tags, role (organizer/participant), and participant count.',
      parameters: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['participant', 'organizer', 'all'],
            description: 'Filter by user role. "all" returns both organized and joined events.',
          },
          timeframe: {
            type: 'string',
            enum: ['today', 'this_week', 'next_week', 'this_weekend', 'this_month', 'next_month', 'upcoming', 'past', 'all'],
            description: 'Time period filter. "upcoming" = future events, "past" = past events.',
          },
          tag: {
            type: 'string',
            description: 'Filter by tag name (e.g. "tech", "music"). Case-insensitive.',
          },
          date: {
            type: 'string',
            description: 'Filter by specific date in YYYY-MM-DD format. Use when user asks about a specific date.',
          },
          dateFrom: {
            type: 'string',
            description: 'Start date of a date range in YYYY-MM-DD format. Use together with dateTo for date range queries.',
          },
          dateTo: {
            type: 'string',
            description: 'End date of a date range in YYYY-MM-DD format. Use together with dateFrom for date range queries.',
          },
          offset: {
            type: 'number',
            description: 'Pagination offset. Use 0 for first page (default), 10 for second page, 20 for third, etc. Use when user asks to "show more" events.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getEventDetails',
      description:
        'Get full details of a specific event including full participant list with names. Use when user asks about a specific event by name.',
      parameters: {
        type: 'object',
        properties: {
          eventTitle: {
            type: 'string',
            description: 'The title (or partial title) of the event to look up.',
          },
        },
        required: ['eventTitle'],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'getPublicEvents',
      description:
        'Get public events visible to everyone. Use for questions about public events the user may not be part of.',
      parameters: {
        type: 'object',
        properties: {
          tag: {
            type: 'string',
            description: 'Filter by tag name.',
          },
          timeframe: {
            type: 'string',
            enum: ['today', 'this_week', 'next_week', 'this_weekend', 'this_month', 'next_month', 'upcoming', 'all'],
            description: 'Time period filter.',
          },
          search: {
            type: 'string',
            description: 'Search by title, description, or location.',
          },
          date: {
            type: 'string',
            description: 'Filter by specific date in YYYY-MM-DD format.',
          },
          dateFrom: {
            type: 'string',
            description: 'Start date of a date range in YYYY-MM-DD format.',
          },
          dateTo: {
            type: 'string',
            description: 'End date of a date range in YYYY-MM-DD format.',
          },
          offset: {
            type: 'number',
            description: 'Pagination offset. Use 0 for first page (default), 10 for second page, 20 for third, etc. Use when user asks to "show more" events.',
          },
        },
        required: [],
      },
    },
  },
  {
    type: 'function' as const,
    function: {
      name: 'countUserEvents',
      description:
        'Count events the user is part of and list them with names and dates. Always use this when user asks "how many events do I have?" or similar counting questions. The response includes event names — always mention them.',
      parameters: {
        type: 'object',
        properties: {
          role: {
            type: 'string',
            enum: ['participant', 'organizer', 'all'],
          },
        },
        required: [],
      },
    },
  },
];
