#!/bin/bash
# 生成国风水墨网站素材
cd /home/z/my-project
mkdir -p public/images

# 主视觉背景：水墨山水全景，中央留白放法器
z-ai image -p "Traditional Chinese ink wash painting landscape panorama, vast misty mountains, calm lake water, pine tree branches hanging from top left corner, bamboo leaves on right edge, small fishing boat with fisherman on water, faded red sun in sky, endless pale rice paper cream background #f5f1e6, elegant negative space in the very center, soft muted colors, shuimo style, minimal, high quality, wide banner" -o public/images/hero-bg.png -s 1344x768 &

# 中央法器：发光的青铜司南（古代罗盘）
z-ai image -p "Ancient Chinese bronze compass Sinan spoon compass on ornate bronze plate with glowing mysterious green bronze patina and golden engraved inscriptions, magical soft golden light aura radiating, floating on pure white background, centered composition, mystical relic, product photography style, high quality, detailed" -o public/images/artifact-sinan.png -s 1024x1024 &

# 封面1：AI教程 - 古代书院与发光竹简
z-ai image -p "Traditional Chinese ink wash painting, ancient academy study pavilion with bamboo scrolls, one bamboo scroll glowing with golden holographic circuit lines and data particles, autumn maple tree, pale cream rice paper background, muted elegant colors, shuimo gufeng style, high quality" -o public/images/cover-tutorials.png -s 1344x768 &

# 封面2：市场分析 - 水墨群山与城市灯火
z-ai image -p "Traditional Chinese ink wash painting, layered misty mountains with a ancient city skyline silhouette, warm lantern lights rising like glowing data points among peaks, river winding through valley, pale cream rice paper background, muted elegant colors, shuimo style, high quality" -o public/images/cover-market.png -s 1344x768 &

# 封面3：高校专业 - 书院学子仰望星空
z-ai image -p "Traditional Chinese ink wash painting, young scholar in hanfu robe standing before ancient academy gate looking up at night sky, stars connected with faint golden constellation lines like neural network, old pine tree, pale cream rice paper background, muted colors with soft gold accents, shuimo style, high quality" -o public/images/cover-majors.png -s 1344x768 &

wait

# 封面4：赛事活动 - 山间论棋
z-ai image -p "Traditional Chinese ink wash painting, two scholars playing weiqi go board game on mountain pavilion terrace above sea of clouds, glowing go stones like floating lights, distant peaks, pale cream rice paper background, muted elegant colors, shuimo style, high quality" -o public/images/cover-events.png -s 1344x768 &

# 封面5：黑客松 - 夜间灯会与热气球
z-ai image -p "Traditional Chinese ink wash painting, festive night scene of ancient Chinese lantern festival, hundreds of glowing sky lanterns floating upward like ideas and innovation, silhouettes of makers and engineers at wooden tables, temple roof, pale cream and warm gold tones, shuimo style, high quality" -o public/images/cover-hackathons.png -s 1344x768 &

# 封面6：云厂商 - 云海仙阁
z-ai image -p "Traditional Chinese ink wash painting, celestial palace pavilions floating on vast sea of clouds, faint golden circuit patterns hidden in cloud swirls, cranes flying, pale cream rice paper background, muted elegant colors with hints of gold, shuimo style, high quality" -o public/images/cover-cloud.png -s 1344x768 &

# 封面7：T-agent 多智能体 - 傀儡戏台
z-ai image -p "Traditional Chinese ink wash painting, ancient Chinese puppet theater stage with multiple elegant wooden puppets connected by visible glowing silk threads and light network above, single puppeteer silhouette, ornate stage roof, pale cream rice paper background, muted colors, shuimo style, high quality" -o public/images/cover-tagent.png -s 1344x768 &

wait
echo "ALL_IMAGES_DONE"
ls -la public/images/
