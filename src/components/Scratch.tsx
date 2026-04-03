import { useEffect, useRef } from "react";
// Reactのフックを使用（副作用処理とDOM参照）

import brushImg from "../assets/brush-stroke.png";
// ブラシ画像（透過PNG）

import sampleImg from "../assets/R.jpg";
// 表示する画像

const ScratchImage = () => {
  // canvas要素を参照するためのrefを作成
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // canvas要素を取得
    const canvas = canvasRef.current!;

    // 2D描画コンテキストを取得（描画処理に使用）
    const ctx = canvas.getContext("2d")!;

    // ブラシ画像オブジェクトを生成
    const brush = new Image();

    // ブラシ画像のパスを設定
    brush.src = brushImg;

    // ブラシを描画する関数
    const drawBrush = (x: number, y: number) => {
      // ブラシサイズをランダムに設定（筆圧のような表現）
      const size = 70 + Math.random() * 50;

      // 回転角度をランダムに設定（自然な手描き感）
      const angle = Math.random() * Math.PI * 2;

      // 不透明度をランダムに設定（濃淡表現）
      const alpha = 0.6 + Math.random() * 0.4;

      // 現在の描画状態を保存
      ctx.save();

      // 不透明度を適用
      ctx.globalAlpha = alpha;

      // 描画位置を(x, y)に移動
      ctx.translate(x, y);

      // 回転を適用
      ctx.rotate(angle);

      // ブラシ画像を描画（中心基準で配置）
      ctx.drawImage(brush, -size / 2, -size / 2, size, size);

      // 保存した状態に戻す（回転や透明度をリセット）
      ctx.restore();
    };

    // ブラシ画像の読み込み完了後に実行
    brush.onload = () => {
      // 通常描画モードに設定（上書き）
      ctx.globalCompositeOperation = "source-over";

      // canvas全体を白で塗りつぶす（マスクのベース）
      ctx.fillStyle = "white";

      // 指定範囲を塗りつぶす
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // 描画モードを「削るモード」に変更
      // → 描画した部分が透明になり、下の画像が見える
      ctx.globalCompositeOperation = "destination-out";

      // 開始位置（右下より少し内側）
      let x = canvas.width * 0.8;
      let y = canvas.height * 0.75;

      // ジグザグ用の時間変数
      let t = 0;

      // アニメーション処理
      const draw = () => {
        // 左上まで到達したら終了
        if (x <= 0 || y <= 0) return;

        // 上方向へ移動（基本進行）
        y -= 4;

        // 左方向＋波形でジグザグ移動
        x -= 5 + Math.sin(t) * 40;

        // 時間を進める（波の変化）
        t += 0.5;

        // 現在位置にブラシを描画（削る）
        drawBrush(x, y);

        // 少し待ってから次フレームを実行（速度調整）
        setTimeout(() => {
          requestAnimationFrame(draw);
        }, 30);
      };

      // アニメーション開始
      draw();
    };
  }, []); // 初回レンダリング時のみ実行

  return (
    <div className="relative w-[500px] h-[400px]">

      {/* 背景画像（削られて見える対象） */}
      <img
        src={sampleImg}
        className="absolute z-0 top-0 left-0 w-full h-full object-cover"
      />

      {/* マスク用canvas（上に重なる） */}
      <canvas
        ref={canvasRef}
        width={500}
        height={400}
        className="absolute z-10 top-0 left-0 w-full h-full"
      />
    </div>
  );
};

export default ScratchImage;