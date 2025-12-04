// Vite 플러그인: 호스트 체크 완전 비활성화
export default function disableHostCheck() {
  return {
    name: 'disable-host-check',
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        // 모든 호스트 허용
        next();
      });
    }
  };
}
