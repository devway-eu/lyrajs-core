import { Container } from './Container.js';
/**
 * Abstract base Service class with dependency injection support
 * @example
 * export class OrderService extends Service {
 *     async createOrder(userId, items) {
 *         const user = await this.services.userService.getUserById(userId);
 *         const order = await this.repositories.orderRepository.save({ userId, items });
 *         return order;
 *     }
 * }
 */
export class Service extends Container {
}
//# sourceMappingURL=Service.js.map