import { useState, useEffect, useRef } from 'react'
import {
  Navigation, MapPin, Compass, Leaf, Car, Shield,
  CreditCard, Award, ArrowRight, History, Sparkles,
  Zap, Clock, RefreshCw, Send, CheckCircle2
} from 'lucide-react'
import { useGreenStore, RideRecord } from '../stores/greenStore'
import { toast } from 'sonner'

// Predefined places in Hanoi
const PLACES = [
  { id: '1', name: 'Hồ Hoàn Kiếm', x: 230, y: 180 },
  { id: '2', name: 'Sân bay Nội Bài', x: 80, y: 40 },
  { id: '3', name: 'Lăng Bác', x: 160, y: 150 },
  { id: '4', name: 'Nhà hát Lớn', x: 260, y: 190 },
  { id: '5', name: 'Hồ Tây', x: 140, y: 90 },
  { id: '6', name: 'Royal City', x: 130, y: 250 },
  { id: '7', name: 'AEON Mall Long Biên', x: 340, y: 160 }
]

const VEHICLES = [
  {
    id: 'BIKE',
    name: 'Xanh SM Bike',
    model: 'VinFast Feliz S',
    rateInit: 15000,
    rateKm: 4800,
    co2Rate: 0.12, // kg saved per km
    pointsRate: 3, // points per km
    icon: '🛵',
    desc: 'Xe máy điện Feliz S êm ái, bảo vệ tầng ô-zôn.'
  },
  {
    id: 'TAXI',
    name: 'Xanh SM Taxi',
    model: 'VinFast VF e34 / VF 5',
    rateInit: 20000,
    rateKm: 14000,
    co2Rate: 0.24,
    pointsRate: 5,
    icon: '🚙',
    desc: 'Taxi điện thông minh, rộng rãi, không mùi, không tiếng động.'
  },
  {
    id: 'LUXURY',
    name: 'Xanh Luxury',
    model: 'VinFast VF 8',
    rateInit: 21000,
    rateKm: 19000,
    co2Rate: 0.32,
    pointsRate: 8,
    icon: '💎',
    desc: 'Xe cao cấp VF 8 sang trọng đẳng cấp 5 sao.'
  }
]

const PROMO_CODES: Record<string, number> = {
  'XANHSM': 20000,
  'GREENENERGY': 50000,
  'VINFAST50': 0.5, // 50% discount
}

function fmt(n: number) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n)
}

export default function XanhSM() {
  const store = useGreenStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Booking states
  const [pickupId, setPickupId] = useState('1')
  const [destId, setDestId] = useState('2')
  const [selectedVehicle, setSelectedVehicle] = useState<'BIKE' | 'TAXI' | 'LUXURY'>('TAXI')
  const [promoCode, setPromoCode] = useState('')
  const [discountPercent, setDiscountPercent] = useState(0)
  const [discountAmount, setDiscountAmount] = useState(0)

  // Ride simulator states
  // 'IDLE' -> 'FINDING' -> 'COMING' -> 'TRIP' -> 'ARRIVED'
  const [rideStatus, setRideStatus] = useState<'IDLE' | 'FINDING' | 'COMING' | 'TRIP' | 'ARRIVED'>('IDLE')
  const [driverName, setDriverName] = useState('')
  const [licensePlate, setLicensePlate] = useState('')
  const [progress, setProgress] = useState(0) // 0 to 1

  // Computed fields
  const [distance, setDistance] = useState(28) // default Hồ Hoàn Kiếm -> Nội Bài
  const [fare, setFare] = useState(0)
  const [finalFare, setFinalFare] = useState(0)
  const [co2Saved, setCo2Saved] = useState(0)
  const [pointsEarned, setPointsEarned] = useState(0)

  // Redeem rewards
  const [redeemed, setRedeemed] = useState<string[]>([])

  const currentPickup = PLACES.find(p => p.id === pickupId) || PLACES[0]
  const currentDest = PLACES.find(p => p.id === destId) || PLACES[1]
  const currentVehicle = VEHICLES.find(v => v.id === selectedVehicle) || VEHICLES[1]

  // Calculate distance & price
  useEffect(() => {
    // Pythagorean distance mock
    const dx = currentPickup.x - currentDest.x
    const dy = currentPickup.y - currentDest.y
    const calcDistance = Math.max(1.5, parseFloat((Math.sqrt(dx * dx + dy * dy) * 0.1).toFixed(1)))
    setDistance(calcDistance)
  }, [pickupId, destId])

  useEffect(() => {
    // Calculate base fare
    const base = currentVehicle.rateInit
    const perKm = Math.max(0, distance - 1) * currentVehicle.rateKm
    const total = base + perKm
    setFare(total)

    // Calculate metrics
    setCo2Saved(parseFloat((distance * currentVehicle.co2Rate).toFixed(2)))
    setPointsEarned(Math.ceil(distance * currentVehicle.pointsRate))

    // Apply promo code
    let appliedDiscount = 0
    if (promoCode) {
      const code = promoCode.toUpperCase()
      if (PROMO_CODES[code] !== undefined) {
        const val = PROMO_CODES[code]
        if (val < 1) {
          appliedDiscount = total * val
        } else {
          appliedDiscount = Math.min(total, val)
        }
      }
    }
    setDiscountAmount(appliedDiscount)
    setFinalFare(Math.max(0, total - appliedDiscount))
  }, [distance, selectedVehicle, promoCode])

  // Apply promo input
  const handleApplyPromo = (code: string) => {
    if (PROMO_CODES[code.toUpperCase()] !== undefined) {
      setPromoCode(code.toUpperCase())
      toast.success('Áp dụng mã giảm giá thành công!')
    } else {
      toast.error('Mã giảm giá không tồn tại')
    }
  }

  // Draw Map
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number

    const drawMap = () => {
      // Clear canvas
      ctx.fillStyle = '#090f1d'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines
      ctx.strokeStyle = 'rgba(255,255,255,0.02)'
      ctx.lineWidth = 1
      for (let i = 0; i < canvas.width; i += 20) {
        ctx.beginPath()
        ctx.moveTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()
      }
      for (let j = 0; j < canvas.height; j += 20) {
        ctx.beginPath()
        ctx.moveTo(0, j)
        ctx.lineTo(canvas.width, j)
        ctx.stroke()
      }

      // Draw virtual streets
      ctx.strokeStyle = 'rgba(255,255,255,0.05)'
      ctx.lineWidth = 2
      // Street H
      ctx.beginPath()
      ctx.moveTo(50, 180); ctx.lineTo(350, 180)
      ctx.moveTo(140, 90); ctx.lineTo(140, 270)
      ctx.moveTo(80, 40); ctx.lineTo(230, 180)
      ctx.stroke()

      // Draw all landmarks
      PLACES.forEach(place => {
        const isActive = place.id === pickupId || place.id === destId
        
        // Ring
        ctx.beginPath()
        ctx.arc(place.x, place.y, isActive ? 12 : 6, 0, 2 * Math.PI)
        ctx.fillStyle = isActive ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.08)'
        ctx.fill()
        ctx.strokeStyle = isActive ? '#10b981' : 'rgba(255,255,255,0.2)'
        ctx.lineWidth = isActive ? 2 : 1
        ctx.stroke()

        // Core dot
        ctx.beginPath()
        ctx.arc(place.x, place.y, isActive ? 5 : 2.5, 0, 2 * Math.PI)
        ctx.fillStyle = isActive ? '#34d399' : 'rgba(255,255,255,0.4)'
        ctx.fill()

        // Label
        ctx.fillStyle = isActive ? '#ffffff' : 'rgba(255,255,255,0.35)'
        ctx.font = isActive ? 'bold 9px sans-serif' : '8px sans-serif'
        ctx.fillText(place.name, place.x - 30, place.y - 12)
      })

      // Draw active route path
      if (currentPickup && currentDest) {
        ctx.strokeStyle = '#10b981'
        ctx.lineWidth = 3
        ctx.shadowColor = '#10b981'
        ctx.shadowBlur = 8
        ctx.setLineDash([4, 4])
        
        ctx.beginPath()
        ctx.moveTo(currentPickup.x, currentPickup.y)
        // Draw slightly curved bezier
        const cpX = (currentPickup.x + currentDest.x) / 2 + 30
        const cpY = (currentPickup.y + currentDest.y) / 2 - 30
        ctx.quadraticCurveTo(cpX, cpY, currentDest.x, currentDest.y)
        ctx.stroke()
        
        ctx.setLineDash([])
        ctx.shadowBlur = 0 // reset shadow

        // If trip is running, animate driver car icon
        if ((rideStatus === 'TRIP' || rideStatus === 'COMING') && progress > 0) {
          // Calculate point along bezier curve
          const t = progress
          const startX = rideStatus === 'COMING' ? currentPickup.x - 40 : currentPickup.x
          const startY = rideStatus === 'COMING' ? currentPickup.y - 40 : currentPickup.y
          const endX = rideStatus === 'COMING' ? currentPickup.x : currentDest.x
          const endY = rideStatus === 'COMING' ? currentPickup.y : currentDest.y
          const controlX = (startX + endX) / 2 + 20
          const controlY = (startY + endY) / 2 - 20

          // Bezier point formula
          const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * controlX + t * t * endX
          const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * controlY + t * t * endY

          // Draw Glowing Vehicle Dot
          ctx.beginPath()
          ctx.arc(x, y, 9, 0, 2 * Math.PI)
          ctx.fillStyle = rideStatus === 'COMING' ? '#eab308' : '#3b82f6'
          ctx.shadowColor = rideStatus === 'COMING' ? '#eab308' : '#3b82f6'
          ctx.shadowBlur = 10
          ctx.fill()
          ctx.shadowBlur = 0

          // Vehicle icon overlay
          ctx.fillStyle = '#ffffff'
          ctx.font = '8px Arial'
          ctx.fillText(selectedVehicle === 'BIKE' ? '🛵' : '🚙', x - 5, y + 3)
        }
      }
    }

    const renderLoop = () => {
      drawMap()
      animationFrameId = requestAnimationFrame(renderLoop)
    }

    renderLoop()

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [pickupId, destId, rideStatus, progress, selectedVehicle])

  // Ride lifecycle simulation
  const startRideSimulation = () => {
    if (pickupId === destId) {
      toast.error('Điểm đón và điểm đến không được trùng nhau')
      return
    }

    if (store.greenCardBalance < finalFare && store.blueCardBalance < finalFare) {
      toast.error('Số dư các thẻ chính/phụ không đủ. Vui lòng nạp tiền!')
      return
    }

    // Driver Names
    const firstNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Vũ']
    const lastNames = ['Hùng', 'Minh', 'Tuấn', 'Dũng', 'Sơn', 'Hải', 'Phong']
    const randomDriver = `${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`
    const randomPlate = `29A-${Math.floor(10000 + Math.random() * 90000)}`
    
    setDriverName(randomDriver)
    setLicensePlate(randomPlate)
    setRideStatus('FINDING')
    setProgress(0)

    // Step 1: Finding Driver (2s)
    setTimeout(() => {
      setRideStatus('COMING')
      toast.info(`Tài xế ${randomDriver} (${randomPlate}) đã nhận chuyến và đang di chuyển tới điểm đón!`)
      
      // Animate driver coming (3s)
      animateProgress(3000, () => {
        setRideStatus('TRIP')
        setProgress(0)
        toast.info('Tài xế đã đón bạn. Bắt đầu hành trình xanh!')

        // Animate trip (4s)
        animateProgress(4000, () => {
          setRideStatus('ARRIVED')
          
          // Trực tiếp trừ tiền và lưu lịch sử
          store.addRideRecord({
            pickup: currentPickup.name,
            destination: currentDest.name,
            vehicleType: selectedVehicle,
            vehicleName: `${currentVehicle.name} (${currentVehicle.model})`,
            distance,
            fare: finalFare,
            co2Saved,
            pointsEarned
          })

          toast.success(`Giao dịch thành công: Đã thanh toán ${fmt(finalFare)}. Giảm ${co2Saved}kg CO₂!`)
        })
      })
    }, 2000)
  }

  const animateProgress = (duration: number, onComplete: () => void) => {
    const start = performance.now()
    const frame = (now: number) => {
      const time = now - start
      const pct = Math.min(time / duration, 1)
      setProgress(pct)
      if (pct < 1) {
        requestAnimationFrame(frame)
      } else {
        onComplete()
      }
    }
    requestAnimationFrame(frame)
  }

  const handleResetRide = () => {
    setRideStatus('IDLE')
    setProgress(0)
  }

  const redeemReward = (rewardId: string, cost: number, rewardLabel: string) => {
    if (store.greenPoints < cost) {
      toast.error('Bạn không đủ điểm Xanh để đổi voucher này!')
      return
    }
    store.addGreenPoints(-cost)
    setRedeemed(prev => [...prev, rewardId])
    toast.success(`Đổi voucher thành công! Mã ưu đãi của bạn: ECO-${Math.floor(100000 + Math.random() * 900000)}`)
  }

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-2">
            <Car className="w-8 h-8 text-emerald-400" />
            Di chuyển Xanh (Xanh SM)
          </h1>
          <p className="text-muted mt-1">Đồng hành cùng VinFast giảm khí thải CO₂ bảo vệ bầu khí quyển</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="badge badge-teal flex items-center gap-1">
            <Shield className="w-3.5 h-3.5" />Bảo hiểm chuyến đi GreenCare
          </span>
        </div>
      </div>

      {/* Main Grid: Left Map & Booking form, Right Stats & Loyalty */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Col 1 & 2): Booking Interface & Map */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Active Booking Simulator State Panel */}
          {rideStatus !== 'IDLE' && (
            <div className="card border-emerald-500/20 bg-emerald-500/5 p-4 animate-fade-in space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400 animate-spin" />
                  {rideStatus === 'FINDING' ? 'Đang tìm tài xế...' : 
                   rideStatus === 'COMING' ? 'Tài xế đang đến điểm đón...' : 
                   rideStatus === 'TRIP' ? 'Hành trình di chuyển...' : 'Đã hoàn thành chuyến đi!'}
                </span>
                {rideStatus === 'ARRIVED' && (
                  <button onClick={handleResetRide} className="btn btn-secondary text-[10px] py-1 px-2.5 flex items-center gap-1">
                    Đặt chuyến mới
                  </button>
                )}
              </div>
              
              <div className="progress-bar">
                <div 
                  className={`progress-fill ${rideStatus === 'FINDING' ? 'w-1/4 animate-pulse' : ''}`}
                  style={{ 
                    width: rideStatus === 'FINDING' ? '25%' : `${progress * 100}%`,
                    background: rideStatus === 'COMING' ? '#eab308' : '#10b981'
                  }}
                />
              </div>

              {rideStatus !== 'FINDING' && (
                <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                  <div>
                    <p className="text-muted">Tài xế Xanh SM</p>
                    <p className="font-bold text-white text-sm">{driverName}</p>
                  </div>
                  <div>
                    <p className="text-muted">Phương tiện</p>
                    <p className="font-bold text-white text-sm">{currentVehicle.name} · {licensePlate}</p>
                  </div>
                </div>
              )}

              {rideStatus === 'ARRIVED' && (
                <div className="p-3 bg-white/5 rounded-xl flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white">Bạn vừa đóng góp 1 hành động bảo vệ trái đất!</p>
                    <p className="text-[10px] text-muted">Đã thanh toán {fmt(finalFare)}. Nhận +{pointsEarned} Điểm Xanh & Tiết kiệm {co2Saved}kg CO₂.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Interactive Map Visual Simulator */}
          <div className="card p-0 overflow-hidden relative" style={{ height: '300px' }}>
            <canvas 
              ref={canvasRef} 
              width="450" 
              height="300"
              className="w-full h-full block cursor-crosshair"
            />
            {/* Map Overlay HUD */}
            <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-emerald-400 animate-spin" />
              <span className="text-[10px] text-white/80 font-bold">Hanoi City GPS Grid v2.1</span>
            </div>
            
            {rideStatus === 'IDLE' && (
              <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-sm p-2 rounded-xl border border-white/5 text-[9px] text-muted">
                🖱️ Chọn điểm đón/đến bên dưới để cập nhật bản đồ
              </div>
            )}
          </div>

          {/* Booking Panel Controls */}
          {rideStatus === 'IDLE' && (
            <div className="card space-y-4">
              <h3 className="font-semibold text-white text-sm">Đặt xe Xanh SM ngay</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label flex items-center gap-1"><MapPin className="w-3 h-3 text-emerald-400" />Điểm đón</label>
                  <select
                    value={pickupId}
                    onChange={e => setPickupId(e.target.value)}
                    className="input text-xs"
                  >
                    {PLACES.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label flex items-center gap-1"><Navigation className="w-3 h-3 text-rose-400" />Điểm đến</label>
                  <select
                    value={destId}
                    onChange={e => setDestId(e.target.value)}
                    className="input text-xs"
                  >
                    {PLACES.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Ride type selectors */}
              <div className="space-y-2">
                <label className="label">Chọn dịch vụ di chuyển</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  {VEHICLES.map(v => (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => setSelectedVehicle(v.id as any)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        selectedVehicle === v.id ? 'bg-emerald-500/10 border-emerald-500/40 shadow-glow-green' : 'bg-white/5 border-transparent'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <span className="text-xl">{v.icon}</span>
                        <span className="text-[10px] text-emerald-400 font-bold">-{v.co2Rate}kg CO₂/km</span>
                      </div>
                      <p className="text-xs font-bold text-white mt-2 leading-tight">{v.name}</p>
                      <p className="text-[10px] text-muted truncate mt-0.5">{v.model}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Promo Code & Pricing details */}
              <div className="p-3 bg-white/5 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="label">Mã ưu đãi / Voucher</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="VINFAST50, XANHSM..."
                      className="input text-xs py-1.5"
                      onChange={e => setPromoCode(e.target.value)}
                    />
                    <button 
                      type="button" 
                      onClick={() => handleApplyPromo(promoCode)}
                      className="btn btn-secondary text-xs py-1 px-3"
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted">Khoảng cách:</span>
                    <span className="font-bold text-white">{distance} km</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-xs">
                      <span className="text-muted">Ưu đãi:</span>
                      <span className="font-bold text-emerald-400">-{fmt(discountAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm pt-1 border-t border-white/5">
                    <span className="text-white font-semibold">Ước tính phí:</span>
                    <span className="font-black text-emerald-400 text-base">{fmt(finalFare)}</span>
                  </div>
                </div>
              </div>

              {/* Direct payment notification */}
              <div className="flex items-center gap-2 text-xs text-muted">
                <CreditCard className="w-4 h-4 text-blue-400" />
                Thanh toán tự động bằng **Tài khoản Xanh (Eco Card)** hoặc **Thẻ chính FinGreen** khi đến nơi.
              </div>

              <button
                onClick={startRideSimulation}
                className="btn btn-green w-full text-xs py-3 font-bold flex items-center justify-center gap-2"
              >
                <Car className="w-4 h-4" /> Đặt xe Xanh và Tiết kiệm CO₂
              </button>
            </div>
          )}
        </div>

        {/* Right Column (Col 3): Eco loyalty system */}
        <div className="space-y-4">
          
          {/* Cumulative Eco Impact */}
          <div
            className="card text-center space-y-3"
            style={{
              background: 'linear-gradient(145deg, rgba(6,78,59,0.5) 0%, rgba(5,46,22,0.3) 100%)',
              borderColor: 'rgba(16,185,129,0.2)'
            }}
          >
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30 shadow-glow-green">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-emerald-300 font-bold uppercase tracking-wider">Huy hiệu Eco-Rider</p>
              <h4 className="text-lg font-black text-white mt-0.5">Chiến binh Carbon</h4>
              <p className="text-[10px] text-muted">Hạng: Bạc xanh</p>
            </div>

            <div className="divider opacity-15" />
            
            <div className="grid grid-cols-2 gap-2 text-left">
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-muted">Tích điểm xanh</span>
                <p className="text-base font-black text-white">{store.greenPoints}</p>
              </div>
              <div className="p-2.5 bg-black/20 rounded-xl">
                <span className="text-[10px] text-muted">Tổng CO₂ giảm</span>
                <p className="text-base font-black text-white">{store.co2Saved} kg</p>
              </div>
            </div>
          </div>

          {/* Green Loyalty Redemption Shop */}
          <div className="card space-y-4">
            <h3 className="font-semibold text-white text-sm">Cửa hàng Điểm Xanh</h3>
            
            <div className="space-y-3">
              {[
                { id: 'v-1', label: 'Voucher giảm 20k Xanh SM', cost: 100, desc: 'Giảm trực tiếp vào chuyến đi kế tiếp.' },
                { id: 'v-2', label: 'Miễn phí 1 giờ sạc xe EV', cost: 250, desc: 'Sạc tại trạm sạc đối tác FinGreen.' },
                { id: 'v-3', label: 'Đóng góp 1 cây rừng ngập mặn', cost: 300, desc: 'Trồng rừng ngập mặn Cần Giờ hỗ trợ đa dạng sinh học.' },
              ].map(reward => {
                const isRedeemed = redeemed.includes(reward.id)
                return (
                  <div
                    key={reward.id}
                    className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-2 hover:bg-white/10 transition-all"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-xs font-bold text-white">{reward.label}</p>
                        <p className="text-[9px] text-muted mt-0.5">{reward.desc}</p>
                      </div>
                      <span className="text-[10px] font-black text-emerald-400 whitespace-nowrap bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        {reward.cost} pts
                      </span>
                    </div>
                    
                    <button
                      disabled={isRedeemed || store.greenPoints < reward.cost}
                      onClick={() => redeemReward(reward.id, reward.cost, reward.label)}
                      className={`btn w-full text-[10px] py-1 ${
                        isRedeemed ? 'btn-secondary opacity-60' : 'btn-green'
                      }`}
                    >
                      {isRedeemed ? 'Đã đổi thành công' : 'Đổi thưởng'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Past Rides List */}
          <div className="card">
            <h3 className="font-semibold text-white text-sm mb-3 flex items-center gap-1.5">
              <History className="w-4 h-4 text-emerald-400" />
              Lịch sử chuyến đi
            </h3>

            <div className="space-y-2.5">
              {store.ridesHistory.slice(0, 3).map(ride => (
                <div
                  key={ride.id}
                  className="p-2.5 rounded-xl border border-white/5 bg-white/5 space-y-1 text-xs"
                >
                  <div className="flex justify-between">
                    <span className="font-bold text-white">{ride.pickup} ➔ {ride.destination}</span>
                    <span className="font-bold text-emerald-400">-{fmt(ride.fare)}</span>
                  </div>
                  <div className="flex justify-between text-[10px] text-muted">
                    <span>{ride.vehicleName} · {ride.distance} km</span>
                    <span className="text-emerald-400 font-semibold">-{ride.co2Saved}kg CO₂</span>
                  </div>
                </div>
              ))}

              {store.ridesHistory.length === 0 && (
                <div className="text-center py-6 text-xs text-muted">
                  Bạn chưa thực hiện hành trình nào.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}
