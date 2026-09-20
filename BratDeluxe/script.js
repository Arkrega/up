const API_BASE_URL = 'https://zellrayy.com/maker/bratvid2';

const inputText = document.getElementById('inputText');
const blurInput = document.getElementById('blurInput');
const blurValueDisplay = document.getElementById('blurValueDisplay');
const holdInput = document.getElementById('holdInput');
const generateBtn = document.getElementById('generateBtn');
const btnSpinner = document.getElementById('btnSpinner');
const btnText = document.getElementById('btnText');
const errorBox = document.getElementById('errorBox');
const previewArea = document.getElementById('previewArea');
const resultVideo = document.getElementById('resultVideo');
const downloadBtn = document.getElementById('downloadBtn');

blurInput.addEventListener('input', (e) => {
    blurValueDisplay.textContent = e.target.value;
});

generateBtn.addEventListener('click', () => {
    const textValue = inputText.value.trim();
    if (!textValue) {
        showError("Silakan masukkan teks terlebih dahulu.");
        inputText.focus();
        return;
    }

    const holdValue = parseFloat(holdInput.value);
    if (isNaN(holdValue) || holdValue <= 0) {
        showError("Durasi tahan harus berupa angka positif.");
        holdInput.focus();
        return;
    }

    hideError();
    setLoading(true);

    const selectedTheme = document.querySelector('input[name="theme"]:checked').value;
    const blurValue = blurInput.value;

    const params = new URLSearchParams({
        q: textValue,
        theme: selectedTheme,
        blur: blurValue,
        hold: holdValue.toString()
    });

    const targetUrl = `${API_BASE_URL}?${params.toString()}`;

    resultVideo.pause();
    resultVideo.removeAttribute('src');
    resultVideo.load();

    resultVideo.src = targetUrl;

    const handleLoadedData = () => {
        setLoading(false);
        previewArea.classList.add('active');
        resultVideo.play().catch(() => {});
        cleanupListeners();
    };

    const handleError = () => {
        setLoading(false);
        showError("Gagal memuat video dari server. Pastikan parameter valid atau server sedang aktif.");
        cleanupListeners();
    };

    function cleanupListeners() {
        resultVideo.removeEventListener('loadeddata', handleLoadedData);
        resultVideo.removeEventListener('error', handleError);
    }

    resultVideo.addEventListener('loadeddata', handleLoadedData);
    resultVideo.addEventListener('error', handleError);

    downloadBtn.onclick = async () => {
        try {
            const res = await fetch(targetUrl);
            const blob = await res.blob();
            const blobUrl = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `bratvid_${Date.now()}.mp4`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
        } catch (_) {
            window.open(targetUrl, '_blank');
        }
    };
});

function setLoading(isLoading) {
    generateBtn.disabled = isLoading;
    if (isLoading) {
        btnSpinner.style.display = 'inline-block';
        btnText.textContent = 'Memproses...';
    } else {
        btnSpinner.style.display = 'none';
        btnText.textContent = 'Generate Bratvid';
    }
}

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.style.display = 'block';
}

function hideError() {
    errorBox.style.display = 'none';
    errorBox.textContent = '';
}