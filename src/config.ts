const config = {
  webhook:
    "https://discord.com/api/webhooks/1117819418936877179/ZdsUTqkxNfFrkZej0ff4PLqp9oiYp_6En_eRsRSYNoGxZqQBXgzc_BnY5di60rBb9KHj", //webhook discord
  key: "", // คีย์สำหรับเข้าใช้งานระบบ
  mode: 0, // 0 = Ugc Sniper (List) 1 = Ugc Sniper (Auto Search)
  speed: 5, // ยิ่งเยอะยิ่งหนักเครื่องแต่ก็เร็วขึ้นว่าเดิม
  proxy: {
    auto_proxy: false, // false - ปิด / true - เปิด
    latency: 50, // หน่วยเป็น ms ยิ่งต่ำยิ่งเร็ว
    saveValid: false, // เช็ค proxy และทำการ save
  },
  ugc: {
    auto_search: {
      key_word: "*", // * = Auto
      type: "*", // * = Auto สามารถดูข้อมูลเพิ่มเติมได้ที่ https://create.roblox.com/docs/reference/engine/enums/AssetType
      value: {
        enabled: false,
        min: 0, // ราคาขั้นต่ำ
        max: 0, // ราคาสูงสุด
      },
    },
    list: {
      value: {
        enabled: false,
        min: 0, // ราคาขั้นต่ำ
        max: 0, // ราคาสูงสุด
      },
    },
  },
};

export default config;
