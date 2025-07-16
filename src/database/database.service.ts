import { Injectable, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(private dataSource: DataSource) { }

    async onModuleInit() {
        try {
            this.logger.log('Starting database initialization...');


            await this.ensureTablesExist();

            this.logger.log('Database initialization completed successfully');
        } catch (error) {
            this.logger.error('Error during database initialization:', error);
            throw error;
        }
    }

    private async ensureTablesExist() {
        try {

            const tables = ['user', 'url'];

            for (const table of tables) {
                const tableExists = await this.checkTableExists(table);
                if (!tableExists) {
                    this.logger.warn(`Table '${table}' does not exist. Synchronizing schema...`);
                    await this.synchronizeSchema();
                    break;
                }
            }

            this.logger.log('All required tables exist');
        } catch (error) {
            this.logger.error('Error checking tables:', error);
            throw error;
        }
    }

    private async checkTableExists(tableName: string): Promise<boolean> {
        try {
            const result = await this.dataSource.query(
                `SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        )`,
                [tableName]
            );
            return result[0].exists;
        } catch (error) {
            this.logger.error(`Error checking if table '${tableName}' exists:`, error);
            return false;
        }
    }

    private async synchronizeSchema() {
        try {
            this.logger.log('Synchronizing database schema...');
            await this.dataSource.synchronize();
            this.logger.log('Database schema synchronized successfully');
        } catch (error) {
            this.logger.error('Error synchronizing schema:', error);
            throw error;
        }
    }

    async onModuleDestroy() {
        this.logger.log('Database service destroyed');
    }
} 