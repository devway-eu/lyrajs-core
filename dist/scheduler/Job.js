import { Container } from '../server/Container.js';
/**
 * Abstract base Job class with dependency injection support
 * Jobs can have multiple methods decorated with @Schedule
 * @example
 * import { Job, JobBase, Schedule } from '@lyra-js/core';
 *
 * @Job()
 * export class OrderReportJob extends JobBase {
 *     @Schedule('0 9 * * *')  // Every day at 9 AM
 *     async sendDailyReport() {
 *         const orders = await this.orderRepository.findToday();
 *         await this.emailService.sendReport(orders);
 *     }
 *
 *     @Schedule('0 0 1 * *')  // First day of each month at midnight
 *     async sendMonthlyReport() {
 *         const orders = await this.orderRepository.findThisMonth();
 *         await this.emailService.sendReport(orders);
 *     }
 * }
 */
export class Job extends Container {
}
//# sourceMappingURL=Job.js.map