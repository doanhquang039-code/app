// Mock data for Expense Tracker

export const MOCK_TRANSACTIONS = [
  { id: 1,  desc: 'Lương tháng 6',     type: 'INCOME',  amount: 15_000_000, cat: 'Thu nhập',  icon: '💼', date: '2026-06-01', green: false, note: 'Công ty ABC' },
  { id: 2,  desc: 'Shopee',            type: 'EXPENSE', amount: 450_000,    cat: 'Mua sắm',  icon: '🛒', date: '2026-06-01', green: false, note: 'Đặt hàng #123' },
  { id: 3,  desc: 'Xe đạp điện',       type: 'EXPENSE', amount: 35_000,     cat: 'Di chuyển',icon: '🚲', date: '2026-05-31', green: true,  note: 'EBIKE sharing' },
  { id: 4,  desc: 'Grab Food',         type: 'EXPENSE', amount: 85_000,     cat: 'Ăn uống',  icon: '🍔', date: '2026-05-31', green: false, note: 'Cơm gà + bún bò' },
  { id: 5,  desc: 'Siêu thị organic',  type: 'EXPENSE', amount: 320_000,    cat: 'Thực phẩm',icon: '🥗', date: '2026-05-30', green: true,  note: 'Vinmart+' },
  { id: 6,  desc: 'Netflix',           type: 'EXPENSE', amount: 199_000,    cat: 'Giải trí', icon: '🎬', date: '2026-05-30', green: false, note: 'Premium' },
  { id: 7,  desc: 'Điện nước',         type: 'EXPENSE', amount: 350_000,    cat: 'Sinh hoạt',icon: '💡', date: '2026-05-29', green: false, note: 'Tháng 5/2026' },
  { id: 8,  desc: 'Năng lượng mặt trời',type:'INCOME',  amount: 280_000,    cat: 'Thu nhập', icon: '☀️', date: '2026-05-29', green: true,  note: 'Solar panel sell-back' },
  { id: 9,  desc: 'Gym',               type: 'EXPENSE', amount: 400_000,    cat: 'Sức khỏe', icon: '💪', date: '2026-05-28', green: false, note: 'Tháng 6' },
  { id: 10, desc: 'Chuyển tiền Minh',  type: 'EXPENSE', amount: 500_000,    cat: 'Khác',     icon: '💸', date: '2026-05-28', green: false, note: 'Góp tiền nhậu' },
]

export interface ReceiptItem {
  name: string
  quantity: number
  price: number
}

export interface Receipt {
  id: number
  merchant: string
  date: string
  total: number
  category: string
  items: ReceiptItem[]
  status: 'scanned' | 'pending' | 'added'
}

export const MOCK_RECEIPTS: Receipt[] = [
  {
    id: 1, merchant: 'Lotte Mart', date: '2026-06-01', total: 485000,
    category: 'Thực phẩm', status: 'added',
    items: [
      { name: 'Rau cải xanh', quantity: 2, price: 15000 },
      { name: 'Thịt heo', quantity: 1, price: 120000 },
      { name: 'Sữa Vinamilk', quantity: 3, price: 35000 },
      { name: 'Trứng gà (10 quả)', quantity: 1, price: 45000 },
      { name: 'Bánh mì sandwich', quantity: 2, price: 25000 },
    ],
  },
  {
    id: 2, merchant: 'Circle K', date: '2026-05-31', total: 78000,
    category: 'Ăn uống', status: 'scanned',
    items: [
      { name: 'Cà phê G7', quantity: 1, price: 28000 },
      { name: 'Bánh mì', quantity: 1, price: 20000 },
      { name: 'Nước suối', quantity: 2, price: 15000 },
    ],
  },
  {
    id: 3, merchant: 'Grab Food', date: '2026-05-30', total: 156000,
    category: 'Ăn uống', status: 'pending',
    items: [
      { name: 'Cơm gà xối mỡ', quantity: 1, price: 65000 },
      { name: 'Bún bò Huế', quantity: 1, price: 55000 },
      { name: 'Trà sữa', quantity: 2, price: 18000 },
    ],
  },
]

export const MOCK_TREND = [
  { month: 'T1', 'Thu nhập': 15_000_000, 'Chi tiêu': 9_200_000 },
  { month: 'T2', 'Thu nhập': 15_000_000, 'Chi tiêu': 8_800_000 },
  { month: 'T3', 'Thu nhập': 16_500_000, 'Chi tiêu': 10_100_000 },
  { month: 'T4', 'Thu nhập': 15_000_000, 'Chi tiêu': 9_600_000 },
  { month: 'T5', 'Thu nhập': 18_000_000, 'Chi tiêu': 8_400_000 },
  { month: 'T6', 'Thu nhập': 15_000_000, 'Chi tiêu': 7_800_000 },
]

export const MOCK_CAT = [
  { name: 'Ăn uống',    value: 3_800_000 },
  { name: 'Di chuyển',  value: 1_200_000 },
  { name: 'Giải trí',   value: 900_000 },
  { name: 'Mua sắm',    value: 1_100_000 },
  { name: 'Sức khỏe',   value: 500_000 },
  { name: 'Khác',       value: 300_000 },
]

export const MOCK_CONTACTS = [
  { name: 'Minh Tuấn', avatar: 'MT', color: '#2563eb' },
  { name: 'Lan Anh',   avatar: 'LA', color: '#10b981' },
  { name: 'Huy Đức',   avatar: 'HD', color: '#f59e0b' },
  { name: 'Thu Hà',    avatar: 'TH', color: '#8b5cf6' },
]

export const GREEN_TIPS = [
  { icon: '🌱', text: 'Đi xe đạp giúp giảm 2.3kg CO₂ hôm nay', impact: '-2.3kg' },
  { icon: '♻️', text: 'Mua đồ cũ tiết kiệm 40% carbon', impact: '−40%' },
  { icon: '🥗', text: 'Ăn chay 1 bữa = tiết kiệm 2.5kg CO₂', impact: '-2.5kg' },
]

export const MOCK_INSIGHTS = [
  { type: 'warning',     priority: 'high',   title: 'Ngân sách ăn uống sắp vượt', message: 'Bạn đã chi 85% ngân sách ăn uống. Còn 15% cho 10 ngày còn lại.' },
  { type: 'tip',         priority: 'medium', title: 'Cơ hội tiết kiệm', message: 'Cắt giảm chi tiêu giải trí 20% có thể tiết kiệm ~600,000đ/tháng.' },
  { type: 'achievement', priority: 'low',    title: '🎉 Mục tiêu đạt được!', message: 'Mục tiêu "Mua laptop" đã hoàn thành 100%. Xuất sắc!' },
  { type: 'prediction',  priority: 'medium', title: 'Dự báo tháng tới', message: 'Dựa trên xu hướng, chi tiêu tháng tới khoảng 9,200,000đ.' },
]
