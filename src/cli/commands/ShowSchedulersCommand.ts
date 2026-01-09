import { LyraConsole } from '@/core/console/LyraConsole';
import { SchedulerHelper } from '@/core/scheduler/SchedulerHelper';

/**
 * ShowSchedulersCommand class
 * Displays all registered schedulers in a formatted table
 * Shows scheduler methods, recurrency descriptions, and enabled status
 */
export class ShowSchedulersCommand {
    /**
     * Executes the show:schedulers command
     * Retrieves and displays all schedulers in a formatted table
     * @returns {Promise<void>}
     */
    async execute() {
        const schedulers = await SchedulerHelper.listSchedulers();

        if (schedulers.length === 0) {
            LyraConsole.info(
                'No schedulers found.',
                'Create a job using \'make:job\' command and add schedules with \'make:scheduler\' command.'
            );
            return;
        }

        const schedulersInfo: string[] = ['SCHEDULERS'];

        // Calculate column widths
        const schedulerColumnWidth = Math.max(
            'SCHEDULER'.length,
            ...schedulers.map(s => s.scheduler.length)
        );
        const descriptionColumnWidth = Math.max(
            'DESCRIPTION'.length,
            ...schedulers.map(s => s.description.length)
        );
        const statusColumnWidth = 'STATUS'.length;

        // Top border
        schedulersInfo.push(
            `┌${'─'.repeat(schedulerColumnWidth + 2)}┬${'─'.repeat(descriptionColumnWidth + 2)}┬${'─'.repeat(statusColumnWidth + 2)}┐`
        );

        // Header
        schedulersInfo.push(
            `│ ${'SCHEDULER'.padEnd(schedulerColumnWidth)} │ ${'DESCRIPTION'.padEnd(descriptionColumnWidth)} │ ${'STATUS'.padEnd(statusColumnWidth)} │`
        );

        // Header separator
        schedulersInfo.push(
            `├${'─'.repeat(schedulerColumnWidth + 2)}┼${'─'.repeat(descriptionColumnWidth + 2)}┼${'─'.repeat(statusColumnWidth + 2)}┤`
        );

        // Rows
        for (const scheduler of schedulers) {
            const status = scheduler.enabled ? '✓' : '✗';
            schedulersInfo.push(
                `│ ${scheduler.scheduler.padEnd(schedulerColumnWidth)} │ ${scheduler.description.padEnd(descriptionColumnWidth)} │ ${status.padEnd(statusColumnWidth)} │`
            );
        }

        // Bottom border
        schedulersInfo.push(
            `└${'─'.repeat(schedulerColumnWidth + 2)}┴${'─'.repeat(descriptionColumnWidth + 2)}┴${'─'.repeat(statusColumnWidth + 2)}┘`
        );

        LyraConsole.success(...schedulersInfo);
    }
}
