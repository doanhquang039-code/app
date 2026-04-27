import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../lib/api'
import { toast } from 'sonner'
import {
  Users,
  UserPlus,
  Trophy,
  Target,
  Search,
  Check,
  X,
  Crown,
  TrendingUp,
  Calendar,
  DollarSign,
} from 'lucide-react'

interface Friend {
  id: number
  userId: number
  friendId: number
  status: string
  permissions: any
  friend: {
    id: number
    username: string
    email: string
    fullName?: string
  }
}

interface FriendRequest {
  id: number
  requesterId: number
  receiverId: number
  status: string
  requester: {
    id: number
    username: string
    email: string
    fullName?: string
  }
}

interface Challenge {
  id: number
  title: string
  description: string
  challengeType: string
  targetAmount: number
  startDate: string
  endDate: string
  isPublic: boolean
  createdBy: number
  participants?: any[]
}

interface ChallengeParticipant {
  userId: number
  username: string
  currentAmount: number
  rank: number
}

export default function Social() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'friends' | 'challenges'>('friends')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null)

  // Fetch friends
  const { data: friends, isLoading: friendsLoading } = useQuery({
    queryKey: ['friends'],
    queryFn: async () => {
      const { data } = await api.get('/social/friends')
      return data
    },
  })

  // Fetch friend requests
  const { data: friendRequests, isLoading: requestsLoading } = useQuery({
    queryKey: ['friend-requests'],
    queryFn: async () => {
      const { data } = await api.get('/social/friends/requests')
      return data
    },
  })

  // Search users
  const { data: searchResults, isLoading: searchLoading } = useQuery({
    queryKey: ['search-users', searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.length < 2) return []
      const { data } = await api.get(`/social/users/search?q=${searchQuery}`)
      return data
    },
    enabled: searchQuery.length >= 2,
  })

  // Fetch challenges
  const { data: myChallenges, isLoading: myChallengesLoading } = useQuery({
    queryKey: ['my-challenges'],
    queryFn: async () => {
      const { data } = await api.get('/social/challenges/my')
      return data
    },
    enabled: activeTab === 'challenges',
  })

  const { data: publicChallenges, isLoading: publicChallengesLoading } = useQuery({
    queryKey: ['public-challenges'],
    queryFn: async () => {
      const { data } = await api.get('/social/challenges/public')
      return data
    },
    enabled: activeTab === 'challenges',
  })

  // Fetch challenge leaderboard
  const { data: leaderboard } = useQuery({
    queryKey: ['challenge-leaderboard', selectedChallenge],
    queryFn: async () => {
      if (!selectedChallenge) return []
      const { data } = await api.get(`/social/challenges/${selectedChallenge}/leaderboard`)
      return data
    },
    enabled: !!selectedChallenge,
  })

  // Send friend request mutation
  const sendRequestMutation = useMutation({
    mutationFn: async (friendId: number) => {
      const { data } = await api.post(`/social/friends/request/${friendId}`)
      return data
    },
    onSuccess: () => {
      toast.success('Đã gửi lời mời kết bạn')
      queryClient.invalidateQueries({ queryKey: ['search-users'] })
    },
    onError: () => {
      toast.error('Không thể gửi lời mời kết bạn')
    },
  })

  // Accept friend request mutation
  const acceptRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const { data } = await api.put(`/social/friends/accept/${requestId}`)
      return data
    },
    onSuccess: () => {
      toast.success('Đã chấp nhận lời mời kết bạn')
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
      queryClient.invalidateQueries({ queryKey: ['friends'] })
    },
    onError: () => {
      toast.error('Không thể chấp nhận lời mời')
    },
  })

  // Reject friend request mutation
  const rejectRequestMutation = useMutation({
    mutationFn: async (requestId: number) => {
      const { data } = await api.put(`/social/friends/reject/${requestId}`)
      return data
    },
    onSuccess: () => {
      toast.success('Đã từ chối lời mời kết bạn')
      queryClient.invalidateQueries({ queryKey: ['friend-requests'] })
    },
    onError: () => {
      toast.error('Không thể từ chối lời mời')
    },
  })

  // Join challenge mutation
  const joinChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const { data } = await api.post(`/social/challenges/${challengeId}/join`)
      return data
    },
    onSuccess: () => {
      toast.success('Đã tham gia thử thách')
      queryClient.invalidateQueries({ queryKey: ['my-challenges'] })
      queryClient.invalidateQueries({ queryKey: ['public-challenges'] })
    },
    onError: () => {
      toast.error('Không thể tham gia thử thách')
    },
  })

  // Leave challenge mutation
  const leaveChallengeMutation = useMutation({
    mutationFn: async (challengeId: number) => {
      const { data } = await api.delete(`/social/challenges/${challengeId}/leave`)
      return data
    },
    onSuccess: () => {
      toast.success('Đã rời khỏi thử thách')
      queryClient.invalidateQueries({ queryKey: ['my-challenges'] })
    },
    onError: () => {
      toast.error('Không thể rời khỏi thử thách')
    },
  })

  const getChallengeTypeColor = (type: string) => {
    switch (type) {
      case 'SAVE_MORE':
        return 'bg-green-100 text-green-700'
      case 'SPEND_LESS':
        return 'bg-blue-100 text-blue-700'
      case 'BUDGET_CHALLENGE':
        return 'bg-purple-100 text-purple-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Xã hội</h1>
          <p className="text-gray-600 mt-1">Kết nối bạn bè và tham gia thử thách</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        <button
          onClick={() => setActiveTab('friends')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'friends'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Users className="w-4 h-4 inline mr-2" />
          Bạn bè
        </button>
        <button
          onClick={() => setActiveTab('challenges')}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === 'challenges'
              ? 'text-blue-600 border-b-2 border-blue-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          <Trophy className="w-4 h-4 inline mr-2" />
          Thử thách
        </button>
      </div>

      {/* Friends Tab */}
      {activeTab === 'friends' && (
        <div className="space-y-6">
          {/* Search Users */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Tìm kiếm bạn bè</h3>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input pl-10"
              />
            </div>
            {searchQuery.length >= 2 && (
              <div className="mt-4 space-y-2">
                {searchLoading ? (
                  <p className="text-gray-500 text-center py-4">Đang tìm kiếm...</p>
                ) : searchResults && searchResults.length > 0 ? (
                  searchResults.map((user: any) => (
                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <button
                        onClick={() => sendRequestMutation.mutate(user.id)}
                        disabled={sendRequestMutation.isPending}
                        className="btn-sm btn-primary"
                      >
                        <UserPlus className="w-4 h-4 mr-1" />
                        Kết bạn
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-4">Không tìm thấy người dùng</p>
                )}
              </div>
            )}
          </div>

          {/* Friend Requests */}
          {friendRequests && friendRequests.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Lời mời kết bạn</h3>
              <div className="space-y-3">
                {friendRequests.map((request: FriendRequest) => (
                  <div key={request.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{request.requester.username}</p>
                      <p className="text-sm text-gray-600">{request.requester.email}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => acceptRequestMutation.mutate(request.id)}
                        disabled={acceptRequestMutation.isPending}
                        className="btn-sm bg-green-600 text-white hover:bg-green-700"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => rejectRequestMutation.mutate(request.id)}
                        disabled={rejectRequestMutation.isPending}
                        className="btn-sm bg-red-600 text-white hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Friends List */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Danh sách bạn bè</h3>
            {friendsLoading ? (
              <p className="text-gray-500 text-center py-8">Đang tải...</p>
            ) : friends && friends.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {friends.map((friendship: Friend) => (
                  <div key={friendship.id} className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{friendship.friend.username}</p>
                        <p className="text-sm text-gray-600">{friendship.friend.email}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Chưa có bạn bè nào</p>
                <p className="text-sm text-gray-500 mt-1">Tìm kiếm và kết bạn để bắt đầu</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-6">
          {/* My Challenges */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thử thách của tôi</h3>
            {myChallengesLoading ? (
              <p className="text-gray-500 text-center py-8">Đang tải...</p>
            ) : myChallenges && myChallenges.length > 0 ? (
              <div className="space-y-4">
                {myChallenges.map((challenge: Challenge) => (
                  <div key={challenge.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getChallengeTypeColor(challenge.challengeType)}`}>
                            {challenge.challengeType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{challenge.targetAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(challenge.startDate).toLocaleDateString('vi-VN')} -{' '}
                              {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{challenge.participants?.length || 0} người tham gia</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedChallenge(challenge.id)}
                          className="btn-sm btn-secondary"
                        >
                          <Trophy className="w-4 h-4 mr-1" />
                          Xếp hạng
                        </button>
                        <button
                          onClick={() => leaveChallengeMutation.mutate(challenge.id)}
                          disabled={leaveChallengeMutation.isPending}
                          className="btn-sm bg-red-600 text-white hover:bg-red-700"
                        >
                          Rời
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Bạn chưa tham gia thử thách nào</p>
              </div>
            )}
          </div>

          {/* Public Challenges */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thử thách công khai</h3>
            {publicChallengesLoading ? (
              <p className="text-gray-500 text-center py-8">Đang tải...</p>
            ) : publicChallenges && publicChallenges.length > 0 ? (
              <div className="space-y-4">
                {publicChallenges.map((challenge: Challenge) => (
                  <div key={challenge.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getChallengeTypeColor(challenge.challengeType)}`}>
                            {challenge.challengeType}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Target className="w-4 h-4" />
                            <span>{challenge.targetAmount.toLocaleString()}đ</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(challenge.startDate).toLocaleDateString('vi-VN')} -{' '}
                              {new Date(challenge.endDate).toLocaleDateString('vi-VN')}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => joinChallengeMutation.mutate(challenge.id)}
                        disabled={joinChallengeMutation.isPending}
                        className="btn-sm btn-primary"
                      >
                        Tham gia
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">Không có thử thách công khai nào</p>
              </div>
            )}
          </div>

          {/* Leaderboard Modal */}
          {selectedChallenge && leaderboard && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Bảng xếp hạng</h3>
                  <button
                    onClick={() => setSelectedChallenge(null)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
                <div className="space-y-3">
                  {leaderboard.map((participant: ChallengeParticipant, index: number) => (
                    <div
                      key={participant.userId}
                      className={`flex items-center gap-4 p-4 rounded-lg ${
                        index === 0 ? 'bg-yellow-50 border-2 border-yellow-400' :
                        index === 1 ? 'bg-gray-50 border-2 border-gray-400' :
                        index === 2 ? 'bg-orange-50 border-2 border-orange-400' :
                        'bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white font-bold">
                        {index === 0 ? <Crown className="w-6 h-6 text-yellow-500" /> :
                         index === 1 ? <Crown className="w-6 h-6 text-gray-400" /> :
                         index === 2 ? <Crown className="w-6 h-6 text-orange-400" /> :
                         <span className="text-gray-600">#{index + 1}</span>
                        }
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{participant.username}</p>
                        <p className="text-sm text-gray-600">
                          {participant.currentAmount.toLocaleString()}đ
                        </p>
                      </div>
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
