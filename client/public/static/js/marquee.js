async function updateMarquee() {
    const response = await fetch('/static/data/marqueeData.json');
    const data = await response.json() || { marqueeText: 'Welcome to Meso Card' };
    document.getElementById('marquee').textContent = data.marqueeText;
}

updateMarquee();