import app from "./app";
import postRoutes from './routes/postRoutes';
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import commentRoutes from "./routes/commentRoutes";
import followRoutes from "./routes/followRoutes";
import groupRoutes from "./routes/groupRoutes";
app.use('/api', postRoutes, authRoutes, userRoutes, commentRoutes, followRoutes, groupRoutes );

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running at http://0.0.0.0:${PORT}`);
});
