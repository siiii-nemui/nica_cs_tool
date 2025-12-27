window.NechronicaParser = {
    parse: function(rawText) {
        const extract = (regex, defaultVal = "") => {
            const match = rawText.match(regex);
            return match ? match[1].trim() : defaultVal;
        };

        // 名前
        const charaName = extract(/キャラクター名：(.*)/, "");

        //行動値
        const actionPoint = extract(/行動値：(\d+)/, "0");

        // 回復上限
        const kakeraHeader = /\[記憶のカケラ\][\s　]*内容/;
        const mirenHeader = /\[未練\]/;
        const kakeraSection = rawText.split(kakeraHeader)[1]?.split(mirenHeader)[0] || "";
        const kakeraCount = kakeraSection.trim().split('\n').filter(line => line.trim() !== "").length;

        // 未練
        const mirenSection = rawText.split(/狂気度　　発狂時/)[1]?.split(/■強化値■/)[0] || "";
        const mirenLines = mirenSection.trim().split('\n').filter(line => line.includes(' への '));
        const mirenStatusItems = mirenLines.map(line => {
            // 【への】の前の文字列を取得
            const nameMatch = line.match(/(.*?) への/);
            const name = nameMatch ? nameMatch[1].trim() : "未練";

            // ■ の数をカウント
            const filledCount = (line.match(/■/g) || []).length;

            return {
                label: name,
                value: filledCount,
                max: 4
            };
        });

        // ステータス配列作成
        const statusArray = [
            { label: "最大行動値", value: parseInt(actionPoint), max: parseInt(actionPoint) },
            { label: "回復上限", value: kakeraCount, max: kakeraCount },
        ];
        mirenStatusItems.forEach(item => statusArray.push(item));


        // マニューバ、チャットパレット作成
        const basicPalette = [
            "nm 未練決定",
            "　",
            "1nc+1 対話判定：",
            "1nc 対話判定：",
            "1nc-1 対話判定：",
            "　",
            "1nc+2 狂気判定",
            "1nc+1 狂気判定",
            "1nc 狂気判定",
            "1nc-1 狂気判定",
            "1nc-2 狂気判定",
            "　",
            "1nc+2 行動判定",
            "1nc+1 行動判定",
            "1nc 行動判定",
            "1nc-1 行動判定",
            "1nc-2 行動判定"
        ].join('\n');

        const maneuverSection = rawText.split(/■マニューバ■/)[1]?.split(/■その他■/)[0] || "";
        const maneuverRawLines = maneuverSection.trim().split('\n');

        const maneuverCommands = maneuverRawLines.map(line => {
            // 形式: [ポジション] マニューバ名 : タイミング : コスト : 射程 : 効果
            const match = line.match(/^\[(.*?)\][\s　]+([^:]+):(.*)$/);
            if (!match) return null;

            const bui = match[1].trim();
            const name = match[2].trim();
            // 見出し行（部位、マニューバ名など）は除外
            if (name === "マニューバ名") return null;
            if (name === "") return null;

            // 残りの部分を : で分割
            const details = match[3].split(':').map(s => s.trim());
            const timing = details[0] || "";
            const cost = details[1] || "";
            const range = details[2] || "";
            const effect = details.slice(3).join(':').trim(); // 効果の中に : が含まれる場合を考慮

            return `1na 【${name}】${bui} / ${timing} / ${cost} / ${range} ${effect}`;
        }).filter(cmd => cmd !== null);

        const commands = basicPalette + "\n　\n" + maneuverCommands.join('\n');

        // ココフォリア用JSON
        return {
            kind: "character",
            data: {
                name: charaName,
                memo: "",
                initiative: parseInt(actionPoint),
                status: statusArray,
                commands: commands
            }
        };
    }
};