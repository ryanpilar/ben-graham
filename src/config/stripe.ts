export const PLANS = [
    {
      name: 'Free',
      slug: 'free',
      quota: 10,
      pagesPerPdf: 5,
      numProjects: 1,
      numQuestions: 3,
      price: {
        amount: 0,
        priceIds: {
          test: '',
          production: '',
        },
      },
    },
    {
      name: 'Plus',
      slug: 'plus',
      quota: 50,
      pagesPerPdf: 25,
      numProjects: 10,
      numQuestions: 30,
      price: {
        amount: 35,
        priceIds: {
          test: 'price_1OyU5WG6vPkzZrpkI3b9OO75',
          production: '',
        },
      },
    },
  ]