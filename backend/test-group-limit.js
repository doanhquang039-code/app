/**
 * Script test end-to-end giới hạn tạo nhóm chi tiêu chung
 * Chạy: node test-group-limit.js
 *
 * Kịch bản:
 *   1. Đăng nhập lấy token
 *   2. Tạo nhóm lần 1 → phải thành công
 *   3. Tạo nhóm lần 2 → phải thành công
 *   4. Tạo nhóm lần 3 → phải bị chặn (400 BadRequest)
 */

const BASE_URL = 'http://localhost:3000';

// ⚠️ Thay email/password bằng tài khoản test có role = 'user'
const TEST_CREDENTIALS = {
  email: 'testuser@example.com',
  password: '123456',
};

async function login() {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(TEST_CREDENTIALS),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(`Login failed: ${JSON.stringify(err)}`);
  }
  const data = await res.json();
  return data.access_token;
}

async function createGroup(token, name) {
  const res = await fetch(`${BASE_URL}/shared-expenses/groups`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ groupName: name, description: `Test group: ${name}` }),
  });
  return { status: res.status, body: await res.json() };
}

async function deleteGroup(token, groupId) {
  const res = await fetch(`${BASE_URL}/shared-expenses/groups/${groupId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.status;
}

async function getGroups(token) {
  const res = await fetch(`${BASE_URL}/shared-expenses/groups`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

async function runTests() {
  console.log('=== TEST GIỚI HẠN TẠO NHÓM CHI TIÊU CHUNG ===\n');

  // 1. Login
  console.log('📝 Bước 1: Đăng nhập...');
  let token;
  try {
    token = await login();
    console.log('  ✅ Đăng nhập thành công\n');
  } catch (e) {
    console.error(`  ❌ ${e.message}`);
    process.exit(1);
  }

  // Xóa các nhóm cũ trước khi test để đảm bảo môi trường sạch
  console.log('🧹 Bước 2: Xóa nhóm cũ (nếu có)...');
  const existingGroups = await getGroups(token);
  for (const g of existingGroups) {
    await deleteGroup(token, g.id);
    console.log(`  🗑️  Đã xóa nhóm "${g.groupName}" (id=${g.id})`);
  }
  console.log(`  ✅ Môi trường sạch (đã xóa ${existingGroups.length} nhóm)\n`);

  const createdIds = [];
  let allPassed = true;

  // Test case 1: Tạo nhóm đầu tiên → phải thành công
  console.log('📦 Test 1: Tạo nhóm đầu tiên...');
  const res1 = await createGroup(token, 'Nhóm Du Lịch');
  if (res1.status === 201 || res1.status === 200) {
    console.log(`  ✅ PASS – Tạo thành công (id=${res1.body.id})`);
    createdIds.push(res1.body.id);
  } else {
    console.log(`  ❌ FAIL – Mong đợi 201, nhận ${res1.status}: ${JSON.stringify(res1.body)}`);
    allPassed = false;
  }

  // Test case 2: Tạo nhóm thứ hai → phải thành công
  console.log('📦 Test 2: Tạo nhóm thứ hai...');
  const res2 = await createGroup(token, 'Nhóm Ăn Uống');
  if (res2.status === 201 || res2.status === 200) {
    console.log(`  ✅ PASS – Tạo thành công (id=${res2.body.id})`);
    createdIds.push(res2.body.id);
  } else {
    console.log(`  ❌ FAIL – Mong đợi 201, nhận ${res2.status}: ${JSON.stringify(res2.body)}`);
    allPassed = false;
  }

  // Test case 3: Tạo nhóm thứ ba → PHẢI bị chặn (400)
  console.log('🚫 Test 3: Tạo nhóm thứ ba (phải bị từ chối)...');
  const res3 = await createGroup(token, 'Nhóm Mua Sắm');
  if (res3.status === 400) {
    console.log(`  ✅ PASS – Bị chặn đúng với lỗi: "${res3.body.message}"`);
  } else {
    console.log(`  ❌ FAIL – Mong đợi 400, nhận ${res3.status}: ${JSON.stringify(res3.body)}`);
    allPassed = false;
  }

  // Kết quả
  console.log('\n' + '='.repeat(50));
  if (allPassed) {
    console.log('🎉 TẤT CẢ TESTS ĐỀU PASS! Logic giới hạn nhóm hoạt động đúng.');
  } else {
    console.log('⚠️  MỘT SỐ TEST THẤT BẠI. Kiểm tra lại log ở trên.');
  }

  // Cleanup
  console.log('\n🧹 Dọn dẹp: xóa các nhóm test đã tạo...');
  for (const id of createdIds) {
    const st = await deleteGroup(token, id);
    console.log(`  🗑️  Xóa nhóm id=${id}: HTTP ${st}`);
  }
}

runTests().catch(console.error);
