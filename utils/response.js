export const sendSuccess = (res, data = {}, message = 'Operación exitosa') => {
  return res.status(200).json({
    success: true,
    message,
    data
  });
};

export const sendError = (res, message = 'Error en la operación', status = 400) => {
  return res.status(status).json({
    success: false,
    message
  });
};

const standardResponse = (res, success, message, data = {}, status = 200) => {
  return res.status(status).json({
    success,
    message,
    data
  });
};

export default standardResponse;
