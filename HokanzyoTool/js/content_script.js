$(function() {
    // ボタンを生成
    const html = '<div class="switch-preview-button">CCFOLIA<br>出力</div>';
    const $button = $(html);

    // ボタンのクリック時イベント
    $button.on('click', function () {
        // 画面からテキストを全取得
        const rawText = $('pre').text();

        // TODO: いつか別システム対応する、多分
        // == システムの判定、JSON出力 == //
        let ccfoliaJson = null;

        // ネクロニカ
        if (rawText.includes("■マニューバ■")) {
            console.log("システム判定：永い後日談のネクロニカ");
            ccfoliaJson = window.NechronicaParser.parse(rawText);
        }
        // CoC6版
        if (rawText.includes("SAN：")) {
            console.log("システム判定：クトゥルフ神話TRPG 6版");
            ccfoliaJson = window.COC6Parser.parse(rawText);
        }
        else {
            alert("対応していないシステムです");
            return;
        }

        // クリップボードへ出力
        if (ccfoliaJson) {
            const jsonString = JSON.stringify(ccfoliaJson);
            navigator.clipboard.writeText(jsonString).then(
                () => {
                    alert("クリップボードにデータをコピーしました");
                },
                () => {
                    alert("クリップボードへのコピーに失敗しました");
                }
            );
        }
    });

    // ボタンを画面上に表示
    $('body').append($button);
});