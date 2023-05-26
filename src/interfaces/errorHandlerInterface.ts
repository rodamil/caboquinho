export default interface IErrorHandler {
  [key: string]: { code: number; message: string };
}
