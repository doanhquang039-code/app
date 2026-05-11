import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Avatar,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  LinearProgress,
  Chip,
  Grid,
  IconButton,
  Collapse,
} from '@mui/material';
import {
  School,
  CheckCircle,
  TrendingUp,
  EmojiEvents,
  PlayArrow,
  ExpandMore,
  ExpandLess,
  Refresh,
} from '@mui/icons-material';

interface FinancialLesson {
  id: string;
  title: string;
  description: string;
  duration: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  completed: boolean;
  progress: number;
  tips: string[];
}

interface CoachingPlan {
  currentLevel: string;
  nextGoal: string;
  lessons: FinancialLesson[];
  achievements: string[];
  overallProgress: number;
}

export const AIFinancialCoach: React.FC = () => {
  const [plan, setPlan] = useState<CoachingPlan | null>(null);
  const [activeStep, setActiveStep] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCoachingPlan();
  }, []);

  const fetchCoachingPlan = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai-advisor/coaching-plan', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setPlan(data);
    } catch (error) {
      console.error('Error fetching coaching plan:', error);
      // Mock data
      setPlan({
        currentLevel: 'Người mới bắt đầu',
        nextGoal: 'Thành thạo quản lý ngân sách',
        overallProgress: 35,
        achievements: [
          'Hoàn thành bài học đầu tiên',
          'Tạo ngân sách đầu tiên',
          'Tiết kiệm được 1 triệu đồng',
        ],
        lessons: [
          {
            id: '1',
            title: 'Hiểu về thu nhập và chi tiêu',
            description: 'Học cách phân biệt thu nhập chủ động và thụ động, cách theo dõi chi tiêu hàng ngày',
            duration: '10 phút',
            difficulty: 'beginner',
            completed: true,
            progress: 100,
            tips: [
              'Ghi chép mọi khoản chi tiêu trong 1 tháng',
              'Phân loại chi tiêu thành cần thiết và không cần thiết',
              'Tính tổng thu nhập ròng hàng tháng',
            ],
          },
          {
            id: '2',
            title: 'Xây dựng ngân sách 50/30/20',
            description: 'Áp dụng quy tắc 50% nhu cầu, 30% mong muốn, 20% tiết kiệm',
            duration: '15 phút',
            difficulty: 'beginner',
            completed: true,
            progress: 100,
            tips: [
              '50% cho chi phí thiết yếu (nhà, ăn, đi lại)',
              '30% cho mong muốn (giải trí, mua sắm)',
              '20% cho tiết kiệm và đầu tư',
            ],
          },
          {
            id: '3',
            title: 'Quỹ khẩn cấp - Tại sao quan trọng?',
            description: 'Xây dựng quỹ dự phòng 3-6 tháng chi tiêu',
            duration: '12 phút',
            difficulty: 'intermediate',
            completed: false,
            progress: 60,
            tips: [
              'Bắt đầu với mục tiêu 1 tháng chi tiêu',
              'Tăng dần lên 3-6 tháng',
              'Để ở tài khoản dễ rút nhưng không dễ chi tiêu',
            ],
          },
          {
            id: '4',
            title: 'Đầu tư cơ bản cho người mới',
            description: 'Tìm hiểu về cổ phiếu, trái phiếu, quỹ đầu tư',
            duration: '20 phút',
            difficulty: 'intermediate',
            completed: false,
            progress: 0,
            tips: [
              'Bắt đầu với quỹ chỉ số (index funds)',
              'Đa dạng hóa danh mục đầu tư',
              'Đầu tư dài hạn, không giao dịch ngắn hạn',
            ],
          },
          {
            id: '5',
            title: 'Lập kế hoạch nghỉ hưu',
            description: 'Tính toán số tiền cần thiết và cách đạt được',
            duration: '25 phút',
            difficulty: 'advanced',
            completed: false,
            progress: 0,
            tips: [
              'Tính chi phí sinh hoạt khi nghỉ hưu',
              'Áp dụng quy tắc 4% rút tiền',
              'Bắt đầu sớm để tận dụng lãi kép',
            ],
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpandClick = (lessonId: string) => {
    setExpanded(expanded === lessonId ? null : lessonId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'success';
      case 'intermediate':
        return 'warning';
      case 'advanced':
        return 'error';
      default:
        return 'default';
    }
  };

  const getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'Cơ bản';
      case 'intermediate':
        return 'Trung cấp';
      case 'advanced':
        return 'Nâng cao';
      default:
        return difficulty;
    }
  };

  if (loading || !plan) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <Typography>Đang tải...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <School color="primary" sx={{ fontSize: 32 }} />
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                AI Financial Coach
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Học tập cá nhân hóa với AI
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={fetchCoachingPlan} size="small">
            <Refresh />
          </IconButton>
        </Box>

        {/* Progress Overview */}
        <Card variant="outlined" sx={{ mb: 3, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
          <CardContent>
            <Grid container spacing={2} sx={{ alignItems: 'center' }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Cấp độ hiện tại: <strong>{plan.currentLevel}</strong>
                </Typography>
                <Typography variant="body2" gutterBottom>
                  Mục tiêu tiếp theo: {plan.nextGoal}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={plan.overallProgress}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(255,255,255,0.3)',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: 'white',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ mt: 0.5, display: 'block' }}>
                    Tiến độ: {plan.overallProgress}%
                  </Typography>
                </Box>
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Avatar
                    sx={{
                      width: 80,
                      height: 80,
                      bgcolor: 'white',
                      color: 'primary.main',
                      margin: '0 auto',
                    }}
                  >
                    <School sx={{ fontSize: 40 }} />
                  </Avatar>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Achievements */}
        {plan.achievements.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>
              🏆 Thành tựu
            </Typography>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
              {plan.achievements.map((achievement, index) => (
                <Chip
                  key={index}
                  icon={<EmojiEvents />}
                  label={achievement}
                  color="warning"
                  size="small"
                />
              ))}
            </Box>
          </Box>
        )}

        {/* Lessons */}
        <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
          📚 Lộ trình học tập
        </Typography>

        <Stepper activeStep={activeStep} orientation="vertical">
          {plan.lessons.map((lesson, index) => (
            <Step key={lesson.id} completed={lesson.completed}>
              <StepLabel
                optional={
                  <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
                    <Chip
                      label={getDifficultyLabel(lesson.difficulty)}
                      size="small"
                      color={getDifficultyColor(lesson.difficulty) as any}
                    />
                    <Chip label={lesson.duration} size="small" variant="outlined" />
                  </Box>
                }
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                    {lesson.title}
                  </Typography>
                  {lesson.completed && <CheckCircle color="success" fontSize="small" />}
                </Box>
              </StepLabel>
              <StepContent>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {lesson.description}
                </Typography>

                {lesson.progress > 0 && lesson.progress < 100 && (
                  <Box sx={{ mb: 2 }}>
                    <LinearProgress
                      variant="determinate"
                      value={lesson.progress}
                      sx={{ height: 6, borderRadius: 3 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      Tiến độ: {lesson.progress}%
                    </Typography>
                  </Box>
                )}

                {/* Tips */}
                <Box sx={{ mb: 2 }}>
                  <Button
                    size="small"
                    onClick={() => handleExpandClick(lesson.id)}
                    endIcon={expanded === lesson.id ? <ExpandLess /> : <ExpandMore />}
                  >
                    {expanded === lesson.id ? 'Ẩn' : 'Xem'} mẹo học tập
                  </Button>
                  <Collapse in={expanded === lesson.id}>
                    <Alert severity="info" sx={{ mt: 1 }}>
                      <Typography variant="subtitle2" gutterBottom>
                        💡 Mẹo học tập:
                      </Typography>
                      <ul style={{ margin: 0, paddingLeft: 20 }}>
                        {lesson.tips.map((tip, idx) => (
                          <li key={idx}>
                            <Typography variant="body2">{tip}</Typography>
                          </li>
                        ))}
                      </ul>
                    </Alert>
                  </Collapse>
                </Box>

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {!lesson.completed && (
                    <Button
                      variant="contained"
                      size="small"
                      startIcon={<PlayArrow />}
                      onClick={() => setActiveStep(index)}
                    >
                      {lesson.progress > 0 ? 'Tiếp tục học' : 'Bắt đầu học'}
                    </Button>
                  )}
                  {lesson.completed && (
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<Refresh />}
                    >
                      Học lại
                    </Button>
                  )}
                </Box>
              </StepContent>
            </Step>
          ))}
        </Stepper>

        {/* Motivational Message */}
        <Alert severity="success" icon={<TrendingUp />} sx={{ mt: 3 }}>
          <Typography variant="body2">
            <strong>Tiếp tục phát huy!</strong> Bạn đang trên con đường trở thành chuyên gia tài chính. 
            Mỗi bài học hoàn thành đưa bạn đến gần hơn với mục tiêu tài chính của mình! 💪
          </Typography>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default AIFinancialCoach;
