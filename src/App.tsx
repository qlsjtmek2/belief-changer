import { Button, Input } from './components';

function App() {
  return (
    <div style={{ padding: 'var(--spacing-8)', maxWidth: '600px', margin: '0 auto' }}>
      <h1 style={{ marginBottom: 'var(--spacing-4)' }}>Belief Changer</h1>
      <p style={{ marginBottom: 'var(--spacing-8)' }}>
        확언을 여러 사람의 대화로 변환하여 들려주는 앱
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-6)' }}>
        <Input
          label="확언 입력"
          placeholder="나는 성공한다, 나는 행복하다..."
          fullWidth
        />

        <Input
          label="상세 내용"
          placeholder="추가적인 내용을 입력하세요..."
          multiline
          fullWidth
        />

        <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
          <Button variant="primary">대화 생성</Button>
          <Button variant="secondary">재생</Button>
          <Button variant="ghost">설정</Button>
        </div>
      </div>
    </div>
  );
}

export default App;
