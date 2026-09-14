#!/bin/bash
# 文章正文插图：7 栏目各一张（水墨插画，区别于封面构图）
cd /home/z/my-project

gen() {
  local prompt="$1"; local out="$2"
  for i in 1 2 3; do
    z-ai image -p "$prompt" -o "$out" -s 1344x768 && echo "OK $out" && return 0
    echo "retry $i for $out"; sleep 20
  done
  echo "FAIL $out"
}

gen "Traditional Chinese ink wash painting illustration, a scholar reading glowing bamboo scroll at wooden desk by window, soft lantern light, ink splashes, flowing golden circuit patterns drifting from the scroll like fireflies, indoor study scene, pale cream rice paper background, muted elegant colors, shuimo style, wide composition, high quality" "public/images/illu-tutorials.png"
sleep 8
gen "Traditional Chinese ink wash painting illustration, bird's eye view of a winding mountain road with tiny travelers and horse carriages, milestones and route markers along the path, one path highlighted in faint gold ink leading through valleys, pale cream rice paper background, muted elegant colors, shuimo style, wide composition, high quality" "public/images/illu-market.png"
sleep 8
gen "Traditional Chinese ink wash painting illustration, young students in hanfu robes sitting in ancient academy courtyard under ginkgo tree, teacher pointing at floating glowing scrolls with golden constellation lines connecting books, pale cream rice paper background, muted colors with soft gold accents, shuimo style, wide composition, high quality" "public/images/illu-majors.png"
sleep 8
gen "Traditional Chinese ink wash painting illustration, grand mountain gate archway with lanterns and flags, crowd of travelers queuing on stone steps, an official desk with brush and scroll registry, autumn leaves drifting, pale cream rice paper background, muted elegant colors, shuimo style, wide composition, high quality" "public/images/illu-events.png"
sleep 8
gen "Traditional Chinese ink wash painting illustration, dramatic night hackathon camp inside ancient courtyard, multiple glowing tents and workbenches with scrolls and abacus, sand clock and burning candles, team of scholars collaborating intensely, warm gold light against deep ink night, shuimo style, wide composition, high quality" "public/images/illu-hackathons.png"
sleep 8
gen "Traditional Chinese ink wash painting illustration, market stalls on ancient bridge over misty river, merchants exchanging gold coins and scrolls with price lists, clouds of incense, boats loaded with goods below, pale cream rice paper background, muted elegant colors with gold accents, shuimo style, wide composition, high quality" "public/images/illu-cloud-deals.png"
sleep 8
gen "Traditional Chinese ink wash painting illustration, an orchestra conductor silhouette on mountain peak directing multiple glowing puppet marionettes and paper cranes flying in coordinated formation, luminous silk threads connecting them into constellation network, pale cream rice paper background, muted colors, shuimo style, wide composition, high quality" "public/images/illu-t-agent.png"
echo "ALL_ILLUS_DONE"
