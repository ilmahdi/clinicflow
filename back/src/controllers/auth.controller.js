import * as authService from '../services/auth.service.js';

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });

    const isSecure = process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && req.secure);

    res.cookie('clinicflow_token', result.token, {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000,
      path: '/',
    });

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const isSecure = process.env.COOKIE_SECURE === 'true' || (process.env.NODE_ENV === 'production' && req.secure);

    res.clearCookie('clinicflow_token', {
      httpOnly: true,
      secure: isSecure,
      sameSite: 'strict',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await authService.getCurrentUser(req.user.id);
    res.status(200).json({
      success: true,
      data: { user },
    });
  } catch (error) {
    next(error);
  }
};
