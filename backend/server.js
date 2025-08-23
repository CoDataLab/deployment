// server.js
require("dotenv").config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const morgan = require("morgan");
const errorHandler = require('./server/middleware/errorHandler');
const connectDB = require('./server/database/db');
const cookieParser = require('cookie-parser');
const commentRoutes = require('./server/routes/comment');

const feedsRouter = require('./server/routes/feeds');
const sourceRouter = require('./server/routes/source');
const articleRouter = require('./server/routes/article');
const scrapeHistory = require('./server/routes/scrapeHistory');
const reportingRouter = require('./server/routes/reporting');
const scrapRouter = require('./server/routes/scrap');
const authRoutes = require('./server/routes/auth');
const sourceGroupRoutes = require("./server/routes/sourceGroup");
const tasksRoutes = require("./server/routes/task");
const tensionRoutes = require("./server/routes/tension");
const eventTasksRoutes = require("./server/routes/eventTask");
const pdfRoutes = require("./server/routes/pdf");
const noteRoutes = require('./server/routes/note');
const biasRoutes = require('./server/routes/bias');
const relatedCountryRoutes = require('./server/routes/relatedCountry');
const teamRoutes = require('./server/routes/team');
const pdfGathererRoutes = require('./server/routes/pdfGatherer');
const podcastRoutes = require('./server/routes/podcast');
const mediaScaleIndexRoutes = require('./server/routes/mediaScaleIndex');

const { authenticateToken } = require('./server/utils/jwt');

const app = express();
const server = http.createServer(app);

const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:3031", "https://codatalab.vercel.app", "https://codatalab-badis-s-projects.vercel.app", "https://codatalab.cloud","http://codatalab.cloud"],
        methods: ["GET", "POST"],
        credentials: true
    }
});

class PipelineLogger {
    constructor(socketInstance) {
        this.io = socketInstance;
        this.currentTask = null;
        this.logs = [];
    }

    setCurrentTask(taskId) {
        this.currentTask = taskId;
    }

    log(message, level = 'info', data = {}) {
        const timestamp = new Date().toISOString();
        const logEntry = {
            timestamp,
            level,
            message,
            taskId: this.currentTask,
            data,
            id: Date.now() + Math.random()
        };

        this.logs.push(logEntry);
        
        // Keep only last 1000 logs
        if (this.logs.length > 1000) {
            this.logs = this.logs.slice(-1000);
        }

        // Emit to connected clients
        this.io.emit('pipeline-log', logEntry);
        
        // Console log with formatting
        const levelPrefix = {
            info: '✓',
            warning: '⚠',
            error: '✗',
            success: '✅',
            processing: '⏳'
        }[level] || 'ℹ';

        console.log(`${levelPrefix} [${timestamp}] ${message}`);
        
        if (data && Object.keys(data).length > 0) {
            console.log('  Data:', JSON.stringify(data, null, 2));
        }
    }

    info(message, data = {}) {
        this.log(message, 'info', data);
    }

    success(message, data = {}) {
        this.log(message, 'success', data);
    }

    warning(message, data = {}) {
        this.log(message, 'warning', data);
    }

    error(message, data = {}) {
        this.log(message, 'error', data);
    }

    processing(message, data = {}) {
        this.log(message, 'processing', data);
    }

    getLogs() {
        return this.logs;
    }

    clearLogs() {
        this.logs = [];
        this.io.emit('pipeline-logs-cleared');
    }
}

const logger = new PipelineLogger(io);

global.pipelineLogger = logger;

const corsOptions = {
    origin: ["http://localhost:3031", "https://codatalab.vercel.app", "https://codatalab-badis-s-projects.vercel.app", "https://codatalab.cloud","http://codatalab.cloud"],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(cookieParser());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));
app.use(helmet());
app.use(morgan('common'));
app.use(express.json());
app.set('trust proxy', 1);

connectDB();

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300
});
app.use(limiter);

io.on('connection', (socket) => {
    console.log('Client connected to pipeline logs');
    
    // Send existing logs to newly connected client
    socket.emit('pipeline-logs-history', logger.getLogs());
    
    socket.on('disconnect', () => {
        console.log('Client disconnected from pipeline logs');
    });
    
    // Handle log clearing request
    socket.on('clear-logs', () => {
        logger.clearLogs();
    });
});

app.use('/auth', authRoutes);
app.use('/comment', commentRoutes);


app.use('/', authenticateToken, feedsRouter);
app.use('/source', authenticateToken, sourceRouter);
app.use('/article', authenticateToken, articleRouter);
app.use('/scrape-history', authenticateToken, scrapeHistory);
app.use('/reporting', authenticateToken, reportingRouter);
app.use('/scrap', authenticateToken, scrapRouter);
app.use('/sourceGroup', authenticateToken, sourceGroupRoutes);
app.use('/task', authenticateToken, tasksRoutes);
app.use('/tension', authenticateToken, tensionRoutes);
app.use('/event', authenticateToken, eventTasksRoutes);
app.use('/pdf', authenticateToken, pdfRoutes);
app.use('/notes', authenticateToken, noteRoutes);
app.use('/bias', authenticateToken, biasRoutes);
app.use('/country', authenticateToken, relatedCountryRoutes);
app.use('/team', authenticateToken, teamRoutes);
app.use('/pdfGatherer', authenticateToken, pdfGathererRoutes);
app.use('/podcast', authenticateToken, podcastRoutes);
app.use('/scale', authenticateToken, mediaScaleIndexRoutes);

app.get('/api/pipeline-logs', authenticateToken, (req, res) => {
    res.json({
        logs: logger.getLogs(),
        count: logger.getLogs().length
    });
});

app.delete('/api/pipeline-logs', authenticateToken, (req, res) => {
    logger.clearLogs();
    res.json({ message: 'Logs cleared successfully' });
});

app.use(errorHandler);



module.exports = { app, server, io, logger };
