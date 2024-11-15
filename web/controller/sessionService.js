import Session from '../models/sessionModel.js';

export const getSession = async (shop) => {
  try {
    const session = await Session.findOne({ shop });
    return session;
  } catch (error) {
    console.error('Error fetching session:', error);
    return null;
  }
};

