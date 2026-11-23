(function () {
    const layers = { s1: 700, s2: 200, s3: 100 };
    Object.entries(layers).forEach(([cls, count]) => {
        const el = document.querySelector('.space-bg .' + cls);
        if (!el) return;
        const shadows = [];
        for (let i = 0; i < count; i++) {
            shadows.push(`${Math.floor(Math.random() * 2000)}px ${Math.floor(Math.random() * 2000)}px #fff`);
        }
        el.style.setProperty('--shadows', shadows.join(','));
    });
})();
