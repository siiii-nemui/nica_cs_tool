window.NechronicaParser = {
    parse: function(rawText) {
        const extract = (regex, defaultVal = "") => {
            const match = rawText.match(regex);
            return match ? match[1].trim() : defaultVal;
        };

        const charaName = extract(/キャラクター名：(.*)/, "名前なし");
        const actionPoint = extract(/行動値：(\d+)/, "0");

        // ココフォリア用JSON
        return {
            kind: "character",
            data: {
                name: charaName,
                memo: "",
                initiatve: actionPoint,
                status: [
                    { label: "最大行動値", value: actionPoint, max: actionPoint },
                    { lavel: "回復上限", value: 0, max: 0 },
                    { lavel: "頭", value: 0, max: 0 },
                    { lavel: "腕", value: 0, max: 0 },
                    { lavel: "胴", value: 0, max: 0 },
                    { lavel: "足", value: 0, max: 0 },
                ],
                commands: "■マニューバ判定\n" + (rawText.split(/■マニューバ■/)[1]?.split(/■その他■/)[0]?.trim() || "")
            }
        };
    }
};