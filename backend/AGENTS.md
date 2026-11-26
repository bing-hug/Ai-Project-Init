# AGENTS.md

本仓库后端的 AI 编码约定。改任何 Java 代码、pom、配置前必读；与默认习惯冲突时以本文件为准。
前端规范见 `frontend/AGENTS.md`，接口契约以它为准，本文件只约束后端如何配合。
个人偏好写 `AGENTS.local.md`（不入库）。

---

## 0. 文件优先级

1. `AGENTS.md`（本文件）——后端工程与流程规范，最高优先
2. `frontend/AGENTS.md`——前端契约与请求层约定，涉及接口字段时以它为准
3. `AGENTS.local.md`——个人风格偏好，只覆盖"怎么写"，不覆盖"写到哪"

---

## 1. 技术栈实况

| 项 | 实际值 |
| --- | --- |
| 框架 | Spring Boot 3.5.16（`spring-boot-starter-parent`） |
| 语言 / JDK | Java 21 |
| 构建 | Maven 3.9（`backend/pom.xml` 多模块父工程） |
| 模块 | `contract`（契约）+ `service`（唯一可执行） |
| Web | `spring-boot-starter-web`（内嵌 Tomcat 10.1） |
| 校验 | `spring-boot-starter-validation`（`jakarta.validation`） |
| 序列化 | Jackson |
| 日志 | SLF4J + Logback |
| 测试 | `spring-boot-starter-test`（JUnit 5 + MockMvc） |
| 持久层 | **尚未接入**：没有 jdbc / mybatis-plus / redis starter，`application-local.yml` 里的数据源配置当前不生效 |
| 安全 | **尚未接入** Spring Security |
| 未安装 | Lombok、MapStruct、springdoc、Flyway、Redis 客户端 |

不要假设这些依赖存在。`pom.xml` 里没有的，代码里就写不出来。

---

## 2. 命令

在 `backend` 目录执行：

| 目的 | 命令 |
| --- | --- |
| 全量构建（含测试） | `mvn -B clean package` |
| 跳过测试打包 | `mvn -B -DskipTests package` |
| 安装到本地仓库 | `mvn -B -DskipTests install` |
| 启动（推荐） | `mvn -B -pl service spring-boot:run` |
| 用 jar 启动 | `java -jar service\target\aiproject-init-service-0.0.1-SNAPSHOT.jar` |
| 全部测试 | `mvn -B test` |
| 单个测试 | `mvn -B -pl service test -Dtest=AiProjectInitApplicationTests` |
| 依赖树 | `mvn -pl service dependency:tree` |

- 任何只带 `-pl service`（不带 `-am`）的命令，执行前都要先 `mvn -B -DskipTests install` 一次，否则 `service` 解析不到 `contract` 产物。
- **禁止 `mvn -pl service -am spring-boot:run`**：`-am` 会把父工程和 `contract` 拉进 reactor，`run` 目标在没有主类的模块上直接失败（实测报 `Unable to find a suitable main class`）。
- 端口默认 8080，部署端口用环境变量 `SERVER_PORT` 覆盖。
- 没有 checkstyle、spotless、pre-commit 钩子；代码风格靠本文件约束 + 编译。

---

## 3. 目录职责

```
backend/
  pom.xml                父工程：只放 dependencyManagement、modules、java.version
  contract/              对外契约：DTO、Facade 接口、枚举。不得依赖 web/持久层
    src/main/java/com/aiproject/init/contract/
      common/ApiResponse.java
      <feature>/XxxResponse.java
      <feature>/IXxxFacade.java
  service/               唯一可执行模块：Controller + 业务实现
    src/main/java/com/aiproject/init/service/
      AiProjectInitApplication.java   启动类，不放业务
      common/JsonErrorController.java 全局错误页接管
      common/GlobalExceptionHandler.java 异常出口
      <feature>/XxxController.java   只做参数接收与响应包装
      <feature>/XxxFacade.java       实现 contract 的接口，放业务
    src/main/resources/
      application.yml / application-local.yml
```

新增代码只能落在下列位置：

| 路径 | 职责 | 禁止 |
| --- | --- | --- |
| `contract/<feature>/` | 请求/响应 DTO（record）、Facade 接口 | 放实现类、`@Service`、`@RestController` |
| `service/<feature>/` | Controller、Facade 实现、领域逻辑 | Controller 里写 SQL、拼错误 JSON |
| `service/common/` | 全局横切能力（错误处理、拦截器） | 放具体业务分支 |
| `service/src/test/java/...` | 与主代码同包名的测试类 | 测试依赖生产数据 |

**不存在的目录不要臆造**：没有 `service/domain`、`service/infrastructure`、`service/config` 分层，除非本次任务明确要建。
`contract` 不得反向依赖 `service`；`service` 只能依赖 `contract`。

---

## 4. 硬性规则

1. **所有对外接口都在 `/api` 前缀下**
   Controller 写 `@RequestMapping("/api/<feature>")`。不要为了"好看"去掉 `/api`，前端与 Nginx 都按这个前缀转发。
2. **响应必须是 `ApiResponse<T>`**
   字段固定 `result / code / msg / data`，前端 `src/request/type.ts` 按这个结构解包。**禁止单方面改字段名或类型**，要改先同步前端。
3. **禁止裸返回**
   不允许返回 `Map`、`String`、`List` 或自定义对象作为接口结果；统一 `ApiResponse.ok(data)`。
4. **错误只有两个出口**
   预期内业务失败 → `ApiResponse.error(code, msg)` 或抛异常交给 `GlobalExceptionHandler`；
   禁止在 Controller 里 `try/catch` 后自己拼一个 JSON，禁止吞异常只记日志。
5. **构造器注入**
   禁止字段注入（`@Autowired` 挂在字段上），禁止 `@Resource`。依赖通过构造器传入。
6. **DTO 用 record**
   请求/响应对象一律 `record`，`contract` 里不出现可变实体；禁止把数据库实体直接返给前端。
7. **参数校验用注解**
   约束写在 `contract` 的 DTO 上（`@NotBlank`、`@Size`、`@Min`…），Controller 参数加 `@Valid`，不要手写 if 判空堆校验。
8. **日志用 SLF4J**
   `private static final Logger log = LoggerFactory.getLogger(Xxx.class);`。禁止 `System.out` / `printStackTrace`，禁止打印密码、token、完整请求体。
9. **不引入未用依赖**
   新增依赖必须先说明理由；版本统一写在根 `pom.xml` 的 `dependencyManagement`，子模块 `<dependency>` 不写 `<version>`。
10. **不碰无关代码**
    不改与本任务无关的文件、格式、注释；不顺手重构、不批量重排 import。
11. **不臆造分层**
    当前只有 `contract` + `service` 两层。要加模块先确认，不要自己新建 `api` / `web` / `dal` 模块。

---

## 5. 接口契约

成功：

```json
{ "result": 0, "code": 0, "msg": "ok", "data": { } }
```

失败：

```json
{ "result": -1, "code": 404, "msg": "接口不存在: GET /api/nope", "data": null }
```

| 字段 | 规则 |
| --- | --- |
| `result` | `0` 成功，`-1` 失败。前端对 `-1` 会直接报错，别乱用 |
| `code` | 成功 `0`；失败取 HTTP 状态码 400/401/403/404/405/500 |
| `msg` | 面向用户的中文提示，不出现类名、SQL、堆栈 |
| `data` | 失败一律 `null` |

- HTTP 状态码与 `code` 保持一致：404 就返回 404，不要 200 里塞 `result=-1`。
- 新增接口后用 `curl` 自己验一遍，确认字段名是 `msg` 不是 `message`。

---

## 6. 错误处理

- 404 / 405 / 500 由 `service/common/JsonErrorController` 与 `GlobalExceptionHandler` 统一输出 JSON，**不出现 Whitelabel 页面**。
- 新增异常类型时，在 `GlobalExceptionHandler` 里加 `@ExceptionHandler`，映射到合适的状态码，不要让它落到兜底 500。
- 参数校验失败由 `MethodArgumentNotValidException` / `BindException` 处理，`msg` 取第一个字段错误信息。
- 日志里记完整异常（`log.error("...", ex)`），响应里只给概括文案。
- 不要用 `ResponseEntity<Map>` 临时返回错误；不要改 `server.error.whitelabel.enabled` 来"解决"白页。

---

## 7. 配置与环境变量

| 文件 | 用途 |
| --- | --- |
| `application.yml` | 通用配置：`spring.application.name`、`server.port`、日志级别、激活 profile |
| `application-local.yml` | 本地：数据源、Redis、DEBUG 日志 |
| `sql/` | 数据库初始化脚本，`docker-compose.dev.yml` 首次启动时执行 |

已支持的环境变量：`SERVER_PORT`、`DB_URL`、`DB_USERNAME`、`DB_PASSWORD`、`REDIS_HOST`、`REDIS_PORT`、`REDIS_TIMEOUT`。

- 新增配置项一律给默认值：`${XXX:默认}`，不要写死只能本机跑的值。
- 不要把密码、密钥写进 `application.yml`；走环境变量。
- 接入持久层时：依赖只加到 `service`，`docker-compose*.yml` 的 `DB_URL` 与库名 `aiproject_init` 保持一致，建表脚本放 `sql/`。

---

## 8. 测试

- 现有测试：`AiProjectInitApplicationTests` 只做上下文加载，不要删。
- 新增 Controller 必须补 `MockMvc` 测试，放 `service/src/test/java` 同包路径，覆盖成功与一种失败（404 或 400）。
- 测试不连真实数据库；需要数据时用 mock 或内存实现，不要依赖 docker 里的 MySQL。
- 没跑过就不要写"测试通过"。交付时贴 `mvn -B clean package` 的最后几行。

---

## 9. 命名与格式

| 对象 | 规则 | 示例 |
| --- | --- | --- |
| 包 | 全小写，按 feature 分 | `com.aiproject.init.service.health` |
| Controller | `XxxController` | `HealthController` |
| Facade 接口 | `IXxxFacade`（放 contract） | `IHealthFacade` |
| Facade 实现 | `XxxFacade`（放 service） | `HealthFacade` |
| DTO | `XxxRequest` / `XxxResponse`，record | `HealthResponse` |
| 常量 | `UPPER_SNAKE_CASE` | `SUCCESS_CODE` |
| 方法 / 变量 | camelCase | `resolveStatus` |
| 表名 / 字段 | snake_case（接入数据库后） | `user_profile` |

- 缩进 4 空格（现有代码即如此），UTF-8，类与公开方法写中文 Javadoc，复杂分支写行内注释。
- import 逐个写，禁止 `import xxx.*`；删除不用的 import。
- 不写 `var`（现有代码全部显式类型），不写魔法字符串，重复文案抽常量。

---

## 10. Git 与提交

- Conventional Commits：`type(scope): description`，类型限 `feat / fix / docs / style / refactor / test / chore`，描述用中文。
- 只提交自己改动的文件；不要 `git add -A`。
- 不提交 `target/`、`.env`、IDE 配置；`backend/target` 已在 `.gitignore`。
- 禁止 `git stash`、禁止切分支、禁止 rebase / reset 别人的提交——多 Agent 共用同一工作区。
- 改 pom 的 groupId / artifactId / 主类名属于破坏性变更，必须同步更新 `Dockerfile`、`docker-compose*.yml`、README，并说明受影响范围。

---

## 11. Bug 修复

- **先定位根因再改代码**：交付时必须说清「触发条件 → 请求怎么走 → 哪一行出错」。
- 禁止症状级修补：`try/catch` 吞异常、加 `if` 绕过去、注释掉校验、把 500 改成 200。
- 在责任层修：映射错补 `@RequestMapping`，契约错改 `contract`，错误码错改 `GlobalExceptionHandler`，不要在 Controller 里打补丁。
- 修完给可复现验证：改前必现的 `curl` 命令 + 改后同一命令的输出。

---

## 12. 完成定义

一个后端任务算完成 = 以下全部通过，并贴原始输出：

- [ ] `mvn -B clean package` 成功（编译 + 测试都过）
- [ ] 新接口路径以 `/api` 开头，返回 `ApiResponse`，字段是 `result / code / msg / data`
- [ ] 失败场景返回对应 HTTP 状态码，`msg` 是中文可读文案，不出现堆栈
- [ ] 不存在的路径返回统一 JSON，不是 Whitelabel 页面
- [ ] 没有字段注入、没有 `System.out`、没有未使用的依赖和 import
- [ ] `contract` 里没有实现类，`service` 没有反向被 `contract` 依赖
- [ ] 改过 pom 时，`Dockerfile` 的 jar 路径与 `docker-compose*.yml` 仍可用（jar 匹配用 `*.jar`）
- [ ] 至少用 `curl` 实测过一次成功与一次失败

---

## 13. 交付格式

1. **变更文件清单**：路径 + 一句话说明
2. **根因**：问题为什么发生（触发条件 + 出错点），不是「改了什么」
3. **接口变更**：新增/修改的路径、请求字段、响应字段、错误码
4. **验证**：`curl` 命令 + 输出原文，体现「改前失败、改后通过」
5. **未做的部分**：明确列出没做什么、为什么
