// ページ切り替え機能
document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const targetPage = btn.dataset.page;
        
        // ナビゲーションボタンのアクティブ状態を更新
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        // ページの表示を切り替え
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');
        
        // ページごとの処理
        if (targetPage === 'list') {
            displayEvaluationList();
        } else if (targetPage === 'analysis') {
            displayAnalysis();
        }
    });
});

// 評価データを保存
function saveEvaluation(data) {
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    data.id = Date.now();
    data.createdAt = new Date().toISOString();
    evaluations.push(data);
    localStorage.setItem('evaluations', JSON.stringify(evaluations));
    return data;
}

// 評価フォームの送信処理
document.getElementById('evaluationForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = {
        employeeId: document.getElementById('employeeId').value,
        employeeName: document.getElementById('employeeName').value,
        department: document.getElementById('department').value,
        position: document.getElementById('position').value,
        evaluationPeriod: document.getElementById('evaluationPeriod').value,
        performance: document.querySelector('input[name="performance"]:checked').value,
        communication: document.querySelector('input[name="communication"]:checked').value,
        problemSolving: document.querySelector('input[name="problemSolving"]:checked').value,
        teamwork: document.querySelector('input[name="teamwork"]:checked').value,
        leadership: document.querySelector('input[name="leadership"]:checked').value,
        comments: document.getElementById('comments').value
    };
    
    // 総合評価の計算
    const scores = [
        parseInt(formData.performance),
        parseInt(formData.communication),
        parseInt(formData.problemSolving),
        parseInt(formData.teamwork),
        parseInt(formData.leadership)
    ];
    formData.totalScore = scores.reduce((a, b) => a + b, 0);
    formData.averageScore = (formData.totalScore / scores.length).toFixed(1);
    
    saveEvaluation(formData);
    
    alert('評価を保存しました');
    document.getElementById('evaluationForm').reset();
});

// 評価一覧を表示
function displayEvaluationList() {
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    const listContainer = document.getElementById('evaluationList');
    
    if (evaluations.length === 0) {
        listContainer.innerHTML = '<p>評価データがありません。</p>';
        return;
    }
    
    let html = `
        <table class="evaluation-table">
            <thead>
                <tr>
                    <th>社員番号</th>
                    <th>氏名</th>
                    <th>部署</th>
                    <th>職種</th>
                    <th>評価期間</th>
                    <th>平均評価</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    evaluations.forEach(eval => {
        html += `
            <tr>
                <td>${eval.employeeId}</td>
                <td>${eval.employeeName}</td>
                <td>${eval.department}</td>
                <td>${eval.position || '-'}</td>
                <td>${eval.evaluationPeriod}</td>
                <td>${eval.averageScore}</td>
                <td>
                    <button class="view-btn" onclick="viewEvaluation(${eval.id})">詳細</button>
                    <button class="delete-btn" onclick="deleteEvaluation(${eval.id})">削除</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    listContainer.innerHTML = html;
}

// 評価の詳細を表示
function viewEvaluation(id) {
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    const evaluation = evaluations.find(e => e.id === id);
    
    if (!evaluation) return;
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>評価詳細</h2>
            <p><strong>社員番号:</strong> ${evaluation.employeeId}</p>
            <p><strong>氏名:</strong> ${evaluation.employeeName}</p>
            <p><strong>部署:</strong> ${evaluation.department}</p>
            <p><strong>職種:</strong> ${evaluation.position || '-'}</p>
            <p><strong>評価期間:</strong> ${evaluation.evaluationPeriod}</p>
            <hr>
            <h3>評価項目</h3>
            <p><strong>業績達成度:</strong> ${evaluation.performance}/5</p>
            <p><strong>コミュニケーション能力:</strong> ${evaluation.communication}/5</p>
            <p><strong>問題解決能力:</strong> ${evaluation.problemSolving}/5</p>
            <p><strong>協調性:</strong> ${evaluation.teamwork}/5</p>
            <p><strong>リーダーシップ:</strong> ${evaluation.leadership}/5</p>
            <hr>
            <p><strong>総合評価:</strong> ${evaluation.averageScore}/5</p>
            <p><strong>コメント:</strong> ${evaluation.comments || 'なし'}</p>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    modal.querySelector('.close-modal').addEventListener('click', () => {
        modal.remove();
    });
    
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

// 評価を削除
function deleteEvaluation(id) {
    if (!confirm('この評価を削除してもよろしいですか？')) return;
    
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    const filtered = evaluations.filter(e => e.id !== id);
    localStorage.setItem('evaluations', JSON.stringify(filtered));
    displayEvaluationList();
}

// フィルタリング機能
document.getElementById('filterDepartment').addEventListener('change', filterList);
document.getElementById('filterPosition').addEventListener('change', filterList);
document.getElementById('filterName').addEventListener('input', filterList);

function filterList() {
    const department = document.getElementById('filterDepartment').value;
    const position = document.getElementById('filterPosition').value;
    const name = document.getElementById('filterName').value.toLowerCase();
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    
    const filtered = evaluations.filter(eval => {
        const matchDept = !department || eval.department === department;
        const matchPosition = !position || eval.position === position;
        const matchName = !name || eval.employeeName.toLowerCase().includes(name);
        return matchDept && matchPosition && matchName;
    });
    
    displayFilteredList(filtered);
}

function displayFilteredList(evaluations) {
    const listContainer = document.getElementById('evaluationList');
    
    if (evaluations.length === 0) {
        listContainer.innerHTML = '<p>該当する評価データがありません。</p>';
        return;
    }
    
    let html = `
        <table class="evaluation-table">
            <thead>
                <tr>
                    <th>社員番号</th>
                    <th>氏名</th>
                    <th>部署</th>
                    <th>職種</th>
                    <th>評価期間</th>
                    <th>平均評価</th>
                    <th>操作</th>
                </tr>
            </thead>
            <tbody>
    `;
    
    evaluations.forEach(eval => {
        html += `
            <tr>
                <td>${eval.employeeId}</td>
                <td>${eval.employeeName}</td>
                <td>${eval.department}</td>
                <td>${eval.position || '-'}</td>
                <td>${eval.evaluationPeriod}</td>
                <td>${eval.averageScore}</td>
                <td>
                    <button class="view-btn" onclick="viewEvaluation(${eval.id})">詳細</button>
                    <button class="delete-btn" onclick="deleteEvaluation(${eval.id})">削除</button>
                </td>
            </tr>
        `;
    });
    
    html += '</tbody></table>';
    listContainer.innerHTML = html;
}

// 分析機能
function displayAnalysis() {
    const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
    
    if (evaluations.length === 0) {
        document.getElementById('overallStats').innerHTML = '<p>分析するデータがありません。</p>';
        document.getElementById('departmentStats').innerHTML = '<p>分析するデータがありません。</p>';
        return;
    }
    
    // 全体統計
    const totalAverage = evaluations.reduce((sum, e) => sum + parseFloat(e.averageScore), 0) / evaluations.length;
    const highPerformers = evaluations.filter(e => parseFloat(e.averageScore) >= 4).length;
    const lowPerformers = evaluations.filter(e => parseFloat(e.averageScore) < 3).length;
    
    document.getElementById('overallStats').innerHTML = `
        <div class="stat-item">
            <span class="stat-label">評価件数</span>
            <span class="stat-value">${evaluations.length}件</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">全体平均評価</span>
            <span class="stat-value">${totalAverage.toFixed(2)}/5</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">高評価者数（4以上）</span>
            <span class="stat-value">${highPerformers}人</span>
        </div>
        <div class="stat-item">
            <span class="stat-label">要改善者数（3未満）</span>
            <span class="stat-value">${lowPerformers}人</span>
        </div>
    `;
    
    // 部署別統計
    const departmentStats = {};
    evaluations.forEach(eval => {
        if (!departmentStats[eval.department]) {
            departmentStats[eval.department] = {
                count: 0,
                totalScore: 0
            };
        }
        departmentStats[eval.department].count++;
        departmentStats[eval.department].totalScore += parseFloat(eval.averageScore);
    });
    
    let deptHtml = '';
    Object.entries(departmentStats).forEach(([dept, stats]) => {
        const avg = (stats.totalScore / stats.count).toFixed(2);
        deptHtml += `
            <div class="stat-item">
                <span class="stat-label">${dept}</span>
                <span class="stat-value">${avg}/5 (${stats.count}人)</span>
            </div>
        `;
    });
    
    document.getElementById('departmentStats').innerHTML = deptHtml;
}