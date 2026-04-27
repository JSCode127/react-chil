import { useEffect, useRef } from "react";

// 粒子1つのデータ構造を定義
type Particle = {
  x: number;      // 現在のx座標
  y: number;      // 現在のy座標
  baseX: number;  // 元のx座標（戻る位置）
  baseY: number;  // 元のy座標（戻る位置）
  vx: number;     // x方向の速度
  vy: number;     // y方向の速度
};

const ParticleText = () => {
  // canvas要素を参照するためのref
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // canvasと2Dコンテキストを取得
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    // canvasサイズを画面全体に設定
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // 表示するテキスト
    const text = "SCRATCH";

    // ===== テキストを一度canvasに描画 =====
    ctx.fillStyle = "black"; // 文字色
    ctx.font = "bold 100px 'Noto Serif JP', serif"; // フォント設定
    ctx.textAlign = "center"; // 横中央揃え
    ctx.fillText(text, canvas.width / 2, canvas.height / 2); // 画面中央に描画

    // 描画されたテキストのピクセルデータを取得
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

    // 一度canvasをクリア（粒子描画用にリセット）
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 粒子配列を作成
    const particles: Particle[] = [];

    // ===== テキストを粒子に変換 =====
    for (let y = 0; y < imageData.height; y += 1) {
      for (let x = 0; x < imageData.width; x += 1) {
        // RGBA配列のインデックスを計算
        const index = (y * imageData.width + x) * 4;

        // アルファ値（透明度）が一定以上なら文字とみなす
        if (imageData.data[index + 3] > 128) {
          particles.push({
            x,           // 現在位置
            y,
            baseX: x,    // 元の位置（戻る先）
            baseY: y,
            vx: 0,       // 初期速度
            vy: 0,
          });
        }
      }
    }

    // ===== マウス情報 =====
    const mouse = {
      x: 0,      // 現在のマウス位置X
      y: 0,      // 現在のマウス位置Y
      prevX: 0,  // 前フレームのマウス位置X
      prevY: 0,  // 前フレームのマウス位置Y
      vx: 0,     // マウスの移動速度X
      vy: 0,     // マウスの移動速度Y
      speed: 0,  // マウスの移動スピード（強さ）
      active: false, //マウスが影響中かどうか
    };

    // マウス移動時に情報を更新
    window.addEventListener("mousemove", (e) => {
      // 前回位置を保存
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;

      // 現在位置を更新
      mouse.x = e.clientX;
      mouse.y = e.clientY;

      // 速度を計算（差分）
      mouse.vx = mouse.x - mouse.prevX;
      mouse.vy = mouse.y - mouse.prevY;

      // スピード（ベクトルの長さ）
      mouse.speed = Math.sqrt(mouse.vx * mouse.vx + mouse.vy * mouse.vy);

      mouse.active = true;
    });

    let timeout: number;
    window.addEventListener("mousemove", () => {
      clearTimeout(timeout);
      timeout = window.setTimeout(() => {
        mouse.active = false;
      }, 80); // ← この時間が“離れた判定”
    });

    // ===== アニメーション処理 =====
    const animate = () => {
      // 毎フレームcanvasをクリア
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // 各粒子を更新
      particles.forEach((p) => {
        // マウスとの距離を計算
        const dx = p.x - mouse.x;
        const dy = p.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        const radius = 130; // マウスの影響範囲

        // ===== マウスの影響 =====
        if (dist < radius) {
          // 距離に応じた力（近いほど強い）
          const force = (radius - dist) / radius;

          // マウスから逃げる方向を計算
          const angle = Math.atan2(dy, dx);

          // 基本の反発力
          let power = force * 6;

          // マウス速度でブースト（速いほど強く弾く）
          power *= 1 + mouse.speed * 0.2;

          // 反発を速度に加算
          p.vx += Math.cos(angle) * power;
          p.vy += Math.sin(angle) * power;

          // マウスの動き方向を粒子に伝える（流れ感）
          p.vx += mouse.vx * 0.05;
          p.vy += mouse.vy * 0.05;

          // ランダムなばらつき（自然な崩れ）
          p.vx += (Math.random() - 0.5) * 1.2;
          p.vy += (Math.random() - 0.5) * 1.2;
        } else {
            const dxBase = p.baseX - p.x;
            const dyBase = p.baseY - p.y;

            const distBase = Math.sqrt(dxBase * dxBase + dyBase * dyBase);

            // 距離が離れてるほど強く吸う（重要）
            const magnet = Math.min(distBase * 0.15, 20);

            const angle = Math.atan2(dyBase, dxBase);

            // 吸い込み
            p.vx += Math.cos(angle) * magnet;
            p.vy += Math.sin(angle) * magnet;

            // 強めの減衰でキュッと止める
            p.vx *= 0.8;
            p.vy *= 0.8;
          }

        // ===== 元の位置に戻る力（バネ） =====
        p.vx += (p.baseX - p.x) * 0.07;
        p.vy += (p.baseY - p.y) * 0.07;

        // ===== 減衰（摩擦・粘性） =====
        p.vx *= 0.9;
        p.vy *= 0.9;

        // ===== 位置更新 =====
        p.x += p.vx;
        p.y += p.vy;

        // ===== 粒子描画 =====
        ctx.fillRect(p.x, p.y, 1.5, 1.5);
      });

      // 次フレームへ
      requestAnimationFrame(animate);
    };

    // アニメーション開始
    animate();
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0"
    />
  );
};

export default ParticleText;