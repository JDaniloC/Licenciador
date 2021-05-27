const dev = process.env.NODE_ENV !== 'production';

export const serverURL = dev ? 'http://localhost:3333' : 'https://licenciador.tk';

