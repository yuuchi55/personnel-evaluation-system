// 成功メッセージを表示する関数
function showSuccessMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'success-notification';
    notification.innerHTML = `
        <span style="font-size: 24px; margin-right: 10px;">✓</span>
        ${message}
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

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
    
    // アニメーション付きで保存
    const submitBtn = e.target.querySelector('.submit-btn');
    submitBtn.innerHTML = '<span style="display: inline-block; animation: spin 1s linear infinite;">⏳</span> 保存中...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
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
        
        // 成功メッセージを表示
        showSuccessMessage('評価を保存しました');
        
        // ボタンを元に戻す
        submitBtn.innerHTML = '評価を保存';
        submitBtn.disabled = false;
        
        // フォームをアニメーション付きでリセット
        document.getElementById('evaluationForm').classList.add('form-reset');
        setTimeout(() => {
            document.getElementById('evaluationForm').reset();
            document.getElementById('evaluationForm').classList.remove('form-reset');
        }, 300);
    }, 1000);
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
    
    // レーダーチャートのデータを作成
    const chartData = [
        { label: '業績達成度', value: evaluation.performance },
        { label: 'コミュニケーション', value: evaluation.communication },
        { label: '問題解決能力', value: evaluation.problemSolving },
        { label: '協調性', value: evaluation.teamwork },
        { label: 'リーダーシップ', value: evaluation.leadership }
    ];
    
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-modal">&times;</span>
            <h2>評価詳細</h2>
            <div class="employee-info">
                <div class="info-grid">
                    <div class="info-item">
                        <span class="info-label">社員番号</span>
                        <span class="info-value">${evaluation.employeeId}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">氏名</span>
                        <span class="info-value">${evaluation.employeeName}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">部署</span>
                        <span class="info-value">${evaluation.department}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">職種</span>
                        <span class="info-value">${evaluation.position || '-'}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">評価期間</span>
                        <span class="info-value">${evaluation.evaluationPeriod}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">総合評価</span>
                        <span class="info-value score-display">${evaluation.averageScore}/5</span>
                    </div>
                </div>
            </div>
            <hr>
            <h3>評価項目</h3>
            <div class="evaluation-chart">
                ${chartData.map(item => `
                    <div class="chart-item">
                        <span class="chart-label">${item.label}</span>
                        <div class="chart-bar">
                            <div class="chart-fill" style="width: ${item.value * 20}%; animation: fillBar 0.8s ease-out;">
                                <span class="chart-value">${item.value}/5</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            ${evaluation.comments ? `
                <hr>
                <div class="comment-section">
                    <h3>コメント</h3>
                    <p class="comment-text">${evaluation.comments}</p>
                </div>
            ` : ''}
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
    // カスタム確認ダイアログ
    const confirmModal = document.createElement('div');
    confirmModal.className = 'confirm-modal';
    confirmModal.innerHTML = `
        <div class="confirm-content">
            <span class="confirm-icon">⚠️</span>
            <h3>削除の確認</h3>
            <p>この評価データを削除してもよろしいですか？<br>この操作は取り消せません。</p>
            <div class="confirm-buttons">
                <button class="confirm-yes">削除する</button>
                <button class="confirm-no">キャンセル</button>
            </div>
        </div>
    `;
    document.body.appendChild(confirmModal);
    
    setTimeout(() => confirmModal.classList.add('show'), 10);
    
    confirmModal.querySelector('.confirm-yes').addEventListener('click', () => {
    
        const evaluations = JSON.parse(localStorage.getItem('evaluations') || '[]');
        const filtered = evaluations.filter(e => e.id !== id);
        localStorage.setItem('evaluations', JSON.stringify(filtered));
        
        confirmModal.classList.remove('show');
        setTimeout(() => confirmModal.remove(), 300);
        
        showSuccessMessage('評価データを削除しました');
        displayEvaluationList();
    });
    
    confirmModal.querySelector('.confirm-no').addEventListener('click', () => {
        confirmModal.classList.remove('show');
        setTimeout(() => confirmModal.remove(), 300);
    });
    
    confirmModal.addEventListener('click', (e) => {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('show');
            setTimeout(() => confirmModal.remove(), 300);
        }
    });
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