import { AnnaUniversityReg2021 } from './AnnaUniversityReg2021';
import { AnnaUniversityReg2017 } from './AnnaUniversityReg2017';
import { USFourPointGPA } from './USFourPointGPA';

export const protocolsRegistry = {
  AU_2021: new AnnaUniversityReg2021(),
  AU_2017: new AnnaUniversityReg2017(),
  US_4_0: new USFourPointGPA(),
};

export const getProtocol = (key) => {
  return protocolsRegistry[key] || protocolsRegistry.AU_2021;
};
