import Filter from 'badwords-ko';

const profaneFilter = new Filter();
const additionalWords = [
  '씹새', '니미', '뻐킹', '우라질', '쒸벌럼', '쒸발',
  '쒸발', '씻팔', '시@발', '씨@발', '씨봉', '씨@봉', '쌰갈',
  '비웅신', '피웅신', '비융신', '피융신', '슈벌', '삐웅신',
  '씨밸', '씨벨', '쓉얼', '슈벌', '쓔벌', '쓔발', '개스키', '이소미'
];

profaneFilter.addWords(...additionalWords);

export default profaneFilter;
