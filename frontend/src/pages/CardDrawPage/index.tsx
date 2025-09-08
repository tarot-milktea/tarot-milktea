import { useColors } from '../../hooks/useColors';
import styles from './CardDrawPage.module.css';

function CardDrawPage() {
  const { styles: globalStyles, getColor } = useColors();

  return (
    <div 
      className={styles.container}
      style={{
        ...globalStyles.container
      }}
    >
      {/* 캐릭터 영역 - 나중에 실제 캐릭터 애니메이션으로 대체 */}
      <div 
        className={styles.character}
        style={{
          background: `linear-gradient(135deg, ${getColor('accent', '400')} 0%, ${getColor('accent', '600')} 100%)`,
          boxShadow: `0 0 50px ${getColor('accent', '400')}40`
        }}
      >
        🔮
      </div>

      <h1 
        className={styles.title}
        style={{
          ...globalStyles.heading,
          color: getColor('primary', '200')
        }}
      >
        카드를 선택해주세요
      </h1>
      
      <p 
        className={styles.description}
        style={{
          ...globalStyles.body,
          color: getColor('primary', '300')
        }}
      >
        72장의 카드 중 3장을 선택하시면 과거, 현재, 미래를 알려드립니다
      </p>

      {/* 카드 그리드 - 나중에 실제 카드 애니메이션으로 대체 */}
      <div 
        className={styles.cardGrid}
        style={{
          background: `${getColor('primary', '900')}80`
        }}
      >
        {Array.from({ length: 72 }, (_, index) => (
          <div
            key={index}
            className={styles.card}
            style={{
              background: `linear-gradient(135deg, ${getColor('primary', '800')} 0%, ${getColor('primary', '700')} 100%)`,
              border: `2px solid ${getColor('primary', '600')}`,
              color: getColor('primary', '400'),
              boxShadow: `0 5px 20px ${getColor('accent', '400')}40`
            }}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div 
        className={styles.hint}
        style={{
          ...globalStyles.card,
          background: `${getColor('accent', '400')}20`,
          border: `1px solid ${getColor('accent', '400')}60`
        }}
      >
        <p 
          className={styles.hintText}
          style={{
            ...globalStyles.body,
            color: getColor('accent', '300')
          }}
        >
          💡 카드를 클릭하면 선택됩니다. 총 3장을 선택해주세요.
        </p>
      </div>
    </div>
  );
}

export default CardDrawPage;