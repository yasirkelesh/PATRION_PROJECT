import { User } from '../modules/users/users.entity';

declare global {
  namespace Express {
    interface Request {
      user?: any; // Burada User türünüz yerine any kullanılmıştır, projenizin ihtiyacına göre değiştirebilirsiniz
    }
  }
}