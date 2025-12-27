window.COC6Parser = {
    parse: function(rawText) {
        const extract = (regex, defaultVal = "") => {
            const match = rawText.match(regex);
            return match ? match[1].trim() : defaultVal;
        };

        // 名前
        const charaName = extract(/キャラクター名：(.*)/, "");

        //能力値
        const HP = parseInt(extract(/HP：(\d+)/, "0"));
        const MP = parseInt(extract(/MP：(\d+)/, "0"));
        const sanMatch = rawText.match(/SAN：(\d+)\/(\d+)/);
        const SAN = sanMatch ? parseInt(sanMatch[1]) : 0;
        const maxSAN = sanMatch ? parseInt(sanMatch[2]) : 99;
        const gokeiLine = extract(/=合計=([\s　\d]+)/, "");
        const status = gokeiLine.trim().split(/[\s　]+/).map(n => parseInt(n));
        const str = status[0] || 0;
        const con = status[1] || 0;
        const pow = status[2] || 0;
        const dex = status[3] || 0;
        const app = status[4] || 0;
        const siz = status[5] || 0;
        const int = status[6] || 0;
        const edu = status[7] || 0;
        const initiative = dex;

        // ステータス配列作成
        const statusArray = [
            { label: "HP", value: HP, max: HP },
            { label: "MP", value: MP, max: MP },
            { label: "SAN", value: SAN, max: maxSAN }
        ];

        // パラメータ配列作成
        const paramsArray = [
            { label: "STR", value: str.toString() },
            { label: "CON", value: con.toString() },
            { label: "POW", value: pow.toString() },
            { label: "DEX", value: dex.toString() },
            { label: "APP", value: app.toString() },
            { label: "SIZ", value: siz.toString() },
            { label: "INT", value: int.toString() },
            { label: "EDU", value: edu.toString() }
        ];

        // チャットパレット作成
        const paletteLines = [];

        paletteLines.push("1d100<={SAN} 【正気度ロール】");
        paletteLines.push(`CCB<=${int * 5} 【アイデア】`);
        paletteLines.push(`CCB<=${pow * 5} 【幸運】`);
        paletteLines.push(`CCB<=${edu * 5} 【知識】`);

        const skillRegex = /《(.+?)》[\s　]*(\d+)％/g;
        let skillMatch;
        while ((skillMatch = skillRegex.exec(rawText)) !== null) {
            const skillName = skillMatch[1].trim();
            const skillValue = skillMatch[2];
            if (skillName === "" || skillName === " ") continue;
            paletteLines.push(`CCB<=${skillValue} 【${skillName}】`);
        }

        const db = extract(/ダメージボーナス：(.*)/, "0");
        paletteLines.push(`1d3+${db} 【ダメージ判定】`);
        paletteLines.push(`1d4+${db} 【ダメージ判定】`);
        paletteLines.push(`1d6+${db} 【ダメージ判定】`);

        const footers = [
            "CCB<={STR}*5 【STR × 5】",
            "CCB<={CON}*5 【CON × 5】",
            "CCB<={POW}*5 【POW × 5】",
            "CCB<={DEX}*5 【DEX × 5】",
            "CCB<={APP}*5 【APP × 5】",
            "CCB<={SIZ}*5 【SIZ × 5】",
            "CCB<={INT}*5 【INT × 5】",
            "CCB<={EDU}*5 【EDU × 5】"
        ];
        paletteLines.push(...footers);

        const commands = paletteLines.join('\n');

        // ココフォリア用JSON
        return {
            kind: "character",
            data: {
                name: charaName,
                initiative: initiative,
                status: statusArray,
                params: paramsArray,
                commands: commands
            }
        };
    }
};