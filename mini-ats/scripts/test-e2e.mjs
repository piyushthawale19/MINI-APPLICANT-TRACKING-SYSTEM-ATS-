// test-e2e.mjs
const BASE_URL = 'http://localhost:3000';

async function runTests() {
  console.log('=== STARTING MINI ATS AUTOMATED API & FEATURE TESTS ===\n');
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`✓ PASS: ${message}`);
      passed++;
    } else {
      console.error(`✗ FAIL: ${message}`);
      failed++;
    }
  }

  let demoCookie = '';

  // 1. Check unauthorized access
  try {
    const res = await fetch(`${BASE_URL}/api/candidates`);
    assert(res.status === 401, 'Unauthorized request to /api/candidates returns 401');
  } catch (e) {
    assert(false, `Unauthorized test threw error: ${e.message}`);
  }

  // 2. Check invalid login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'wrong@example.com', password: 'wrongpassword' }),
    });
    assert(res.status === 401, 'Invalid login returns 401');
  } catch (e) {
    assert(false, `Invalid login test threw error: ${e.message}`);
  }

  // 3. Demo login
  try {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'demo@earljobs.ai', password: 'demo123456' }),
    });
    const setCookie = res.headers.get('set-cookie');
    const json = await res.json();
    assert(res.status === 200 && json.user?.email === 'demo@earljobs.ai', 'Demo login succeeds with user info');
    assert(!!setCookie && setCookie.includes('ats_token='), 'Demo login returns ats_token cookie');
    if (setCookie) {
      demoCookie = setCookie.split(';')[0];
    }
  } catch (e) {
    assert(false, `Demo login test threw error: ${e.message}`);
  }

  // 4. Current user /api/auth/me
  try {
    const res = await fetch(`${BASE_URL}/api/auth/me`, {
      headers: { Cookie: demoCookie },
    });
    const json = await res.json();
    assert(res.status === 200 && json.user?.email === 'demo@earljobs.ai', '/api/auth/me returns authenticated user');
  } catch (e) {
    assert(false, `/api/auth/me threw error: ${e.message}`);
  }

  // 5. Dashboard stats /api/dashboard/stats
  try {
    const res = await fetch(`${BASE_URL}/api/dashboard/stats`, {
      headers: { Cookie: demoCookie },
    });
    const stats = await res.json();
    assert(res.status === 200, '/api/dashboard/stats returns 200');
    assert(typeof stats.totalCandidates === 'number' && stats.totalCandidates >= 10, `Dashboard totalCandidates is correct (${stats.totalCandidates})`);
    assert(stats.byStage && typeof stats.byStage['Interview'] === 'number', 'Dashboard has byStage breakdown');
    assert(Array.isArray(stats.recentCandidates), 'Dashboard has recentCandidates array');
  } catch (e) {
    assert(false, `Dashboard stats test threw error: ${e.message}`);
  }

  // 6. Candidates list /api/candidates
  try {
    const res = await fetch(`${BASE_URL}/api/candidates?page=1&limit=5`, {
      headers: { Cookie: demoCookie },
    });
    const json = await res.json();
    assert(res.status === 200, '/api/candidates returns 200');
    assert(Array.isArray(json.data) && json.data.length <= 5, 'Pagination limit respected');
    assert(json.total >= 10, 'Total candidate count is accurate');
  } catch (e) {
    assert(false, `Candidates list threw error: ${e.message}`);
  }

  // 7. Search candidates
  try {
    const res = await fetch(`${BASE_URL}/api/candidates?search=Alice`, {
      headers: { Cookie: demoCookie },
    });
    const json = await res.json();
    assert(res.status === 200 && json.data.some(c => c.fullName.includes('Alice')), 'Search by name returns matching candidate');
  } catch (e) {
    assert(false, `Search candidate threw error: ${e.message}`);
  }

  // 8. Filter by stage
  try {
    const res = await fetch(`${BASE_URL}/api/candidates?stage=Interview`, {
      headers: { Cookie: demoCookie },
    });
    const json = await res.json();
    assert(res.status === 200 && json.data.length > 0 && json.data.every(c => c.hiringStage === 'Interview'), 'Filter by stage returns only candidates in Interview stage');
  } catch (e) {
    assert(false, `Stage filter threw error: ${e.message}`);
  }

  // 9. Sort candidates
  try {
    const res = await fetch(`${BASE_URL}/api/candidates?sortBy=fullName&sortOrder=asc`, {
      headers: { Cookie: demoCookie },
    });
    const json = await res.json();
    assert(res.status === 200 && json.data.length > 1, 'Sort endpoint responds 200');
    const names = json.data.map(c => c.fullName.toLowerCase());
    const isSorted = names.slice(1).every((n, i) => n >= names[i]);
    assert(isSorted, 'Candidates sorted alphabetically by name ascending');
  } catch (e) {
    assert(false, `Sort test threw error: ${e.message}`);
  }

  // 10. Create new candidate
  let createdCandidateId = '';
  try {
    const newCand = {
      fullName: 'Sarah Connor',
      email: 'sarah.connor@sky.net',
      phone: '+1-555-9988',
      appliedRole: 'Cybersecurity Analyst',
      skills: ['Network Security', 'Threat Hunting', 'SIEM'],
      experience: '5 years',
      hiringStage: 'Applied',
      notes: 'Strong defensive security profile',
    };
    const res = await fetch(`${BASE_URL}/api/candidates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: demoCookie,
      },
      body: JSON.stringify(newCand),
    });
    const json = await res.json();
    assert(res.status === 201 && json._id, 'POST /api/candidates creates new candidate');
    createdCandidateId = json._id;
  } catch (e) {
    assert(false, `Create candidate threw error: ${e.message}`);
  }

  // 11. Get candidate by ID
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${createdCandidateId}`, {
      headers: { Cookie: demoCookie },
    });
    const json = await res.json();
    assert(res.status === 200 && json.fullName === 'Sarah Connor', 'GET /api/candidates/:id retrieves candidate');
  } catch (e) {
    assert(false, `Get candidate threw error: ${e.message}`);
  }

  // 12. Update stage via PATCH
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${createdCandidateId}/stage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Cookie: demoCookie,
      },
      body: JSON.stringify({ hiringStage: 'Screening' }),
    });
    const json = await res.json();
    assert(res.status === 200 && json.hiringStage === 'Screening', 'PATCH /api/candidates/:id/stage updates stage to Screening');
  } catch (e) {
    assert(false, `Update stage threw error: ${e.message}`);
  }

  // 13. Update candidate details via PUT
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${createdCandidateId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Cookie: demoCookie,
      },
      body: JSON.stringify({
        fullName: 'Sarah Connor (Updated)',
        email: 'sarah.connor@sky.net',
        phone: '+1-555-9988',
        appliedRole: 'Senior Cybersecurity Analyst',
        skills: ['Network Security', 'Threat Hunting', 'Cloud Security'],
        experience: '6 years',
        hiringStage: 'Screening',
        notes: 'Passed initial screening with flying colors',
      }),
    });
    const json = await res.json();
    assert(res.status === 200 && json.fullName === 'Sarah Connor (Updated)' && json.appliedRole === 'Senior Cybersecurity Analyst', 'PUT /api/candidates/:id updates candidate profile');
  } catch (e) {
    assert(false, `Update candidate threw error: ${e.message}`);
  }

  // 14. Delete candidate
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${createdCandidateId}`, {
      method: 'DELETE',
      headers: { Cookie: demoCookie },
    });
    assert(res.status === 200, 'DELETE /api/candidates/:id deletes candidate');
  } catch (e) {
    assert(false, `Delete candidate threw error: ${e.message}`);
  }

  // 15. Verify candidate is deleted
  try {
    const res = await fetch(`${BASE_URL}/api/candidates/${createdCandidateId}`, {
      headers: { Cookie: demoCookie },
    });
    assert(res.status === 404, 'GET /api/candidates/:id on deleted candidate returns 404');
  } catch (e) {
    assert(false, `Verify delete threw error: ${e.message}`);
  }

  // 16. Test User Registration and Data Isolation
  const randomEmail = `recruiter_${Date.now()}@testats.com`;
  let newRecruiterCookie = '';
  try {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'New Recruiter',
        email: randomEmail,
        password: 'securePassword123!',
      }),
    });
    const setCookie = res.headers.get('set-cookie');
    const json = await res.json();
    assert(res.status === 201 && json.user?.email === randomEmail, 'POST /api/auth/register creates new account');
    if (setCookie) newRecruiterCookie = setCookie.split(';')[0];
  } catch (e) {
    assert(false, `Registration threw error: ${e.message}`);
  }

  // 17. Verify data isolation (New recruiter should have 0 candidates)
  try {
    const res = await fetch(`${BASE_URL}/api/candidates`, {
      headers: { Cookie: newRecruiterCookie },
    });
    const json = await res.json();
    assert(res.status === 200 && json.total === 0, 'New recruiter has 0 candidates (data isolation verified)');
  } catch (e) {
    assert(false, `Data isolation test threw error: ${e.message}`);
  }

  // 18. Logout
  try {
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { Cookie: demoCookie },
    });
    const setCookie = res.headers.get('set-cookie');
    assert(res.status === 200, 'POST /api/auth/logout returns 200');
    assert(!!setCookie && (setCookie.includes('Max-Age=0') || setCookie.includes('ats_token=;')), 'Logout clears ats_token cookie');
  } catch (e) {
    assert(false, `Logout test threw error: ${e.message}`);
  }

  console.log(`\n=== TEST RESULTS: ${passed} PASSED, ${failed} FAILED ===\n`);
  if (failed > 0) process.exit(1);
}

runTests();
