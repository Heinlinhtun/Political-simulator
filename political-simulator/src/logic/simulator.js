// simulator.js
export const systems = {
  COMMUNISM: {
    name: "Communism",
    baseStability: 50,
    calc: (p) => {
      // Formula: (Civic Virtue + Discipline) က အဓိက
      let efficiency = p.m + p.sd - p.c * 0.5;
      let equality = 1.0; // အမြဲတမ်း ညီမျှမှုရှိတယ်လို့ ယူဆမယ်
      return {
        efficiency,
        equality,
        corruptionRisk: p.c > 0.6 ? "High" : "Low",
      };
    },
  },
  FEDERALISM: {
    name: "Federalism",
    baseStability: 70,
    calc: (p) => {
      // Formula: Diversity ကို ကိုင်တွယ်နိုင်စွမ်း ကောင်းတယ်
      let efficiency = (p.h + p.sd) * 0.8;
      let equality = 0.6 + p.sd * 0.2;
      return { efficiency, equality, corruptionRisk: "Medium" };
    },
  },
};
