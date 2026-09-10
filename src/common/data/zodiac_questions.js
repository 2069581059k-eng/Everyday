export default {
  "version": "1.0.0",
  "total_questions": 30,
  "dimensions": [
    {
      "key": "action",
      "name": "行动力",
      "max_raw": 62
    },
    {
      "key": "social",
      "name": "社交性",
      "max_raw": 41
    },
    {
      "key": "rational",
      "name": "理性",
      "max_raw": 76
    },
    {
      "key": "emotional",
      "name": "感性",
      "max_raw": 46
    },
    {
      "key": "stability",
      "name": "稳定性",
      "max_raw": 66
    },
    {
      "key": "curiosity",
      "name": "好奇心",
      "max_raw": 42
    },
    {
      "key": "independence",
      "name": "独立性",
      "max_raw": 65
    },
    {
      "key": "empathy",
      "name": "共情力",
      "max_raw": 53
    },
    {
      "key": "competitiveness",
      "name": "竞争性",
      "max_raw": 20
    },
    {
      "key": "adaptability",
      "name": "适应性",
      "max_raw": 62
    }
  ],
  "questions": [
    {
      "id": 1,
      "scene": "生活习惯",
      "question": "原本安排好的计划突然被打乱，你第一反应通常是？",
      "options": [
        {
          "text": "马上想一个新的方案继续推进",
          "scores": {
            "action": 3,
            "adaptability": 3,
            "independence": 1
          }
        },
        {
          "text": "先弄清楚原因，再重新安排",
          "scores": {
            "rational": 3,
            "stability": 2,
            "adaptability": 1
          }
        },
        {
          "text": "会有点烦，但很快接受变化",
          "scores": {
            "emotional": 2,
            "adaptability": 2,
            "empathy": 1
          }
        },
        {
          "text": "更希望把原计划尽量保留下来",
          "scores": {
            "stability": 3,
            "rational": 1
          }
        }
      ]
    },
    {
      "id": 2,
      "scene": "社交关系",
      "question": "一群不太熟的人聚会时，你通常会？",
      "options": [
        {
          "text": "主动找话题，让气氛热起来",
          "scores": {
            "social": 3,
            "action": 2,
            "adaptability": 1
          }
        },
        {
          "text": "先观察，熟悉后再加入聊天",
          "scores": {
            "rational": 2,
            "social": 1,
            "adaptability": 2
          }
        },
        {
          "text": "和一两个合得来的人深入聊",
          "scores": {
            "empathy": 2,
            "emotional": 2,
            "social": 1
          }
        },
        {
          "text": "更享受安静待着，不强求融入",
          "scores": {
            "independence": 3,
            "stability": 1
          }
        }
      ]
    },
    {
      "id": 3,
      "scene": "决策方式",
      "question": "面对一个重要选择，你更容易依赖什么？",
      "options": [
        {
          "text": "先列优缺点，再做判断",
          "scores": {
            "rational": 3,
            "stability": 2
          }
        },
        {
          "text": "直觉告诉我的第一感觉",
          "scores": {
            "emotional": 3,
            "independence": 2
          }
        },
        {
          "text": "听听信任的人怎么想",
          "scores": {
            "empathy": 3,
            "social": 2
          }
        },
        {
          "text": "先试一小步，再根据结果调整",
          "scores": {
            "action": 2,
            "curiosity": 2,
            "adaptability": 3
          }
        }
      ]
    },
    {
      "id": 4,
      "scene": "情绪处理",
      "question": "别人一句无心的话让你不舒服，你通常会？",
      "options": [
        {
          "text": "当场表达，不让误会积累",
          "scores": {
            "action": 3,
            "independence": 2,
            "social": 1
          }
        },
        {
          "text": "先判断对方是不是故意的",
          "scores": {
            "rational": 3,
            "empathy": 1
          }
        },
        {
          "text": "表面没事，回去后会反复想",
          "scores": {
            "emotional": 3,
            "stability": 1
          }
        },
        {
          "text": "很快过去，不太往心里放",
          "scores": {
            "adaptability": 3,
            "emotional": 1
          }
        }
      ]
    },
    {
      "id": 5,
      "scene": "工作学习",
      "question": "接到一个完全陌生的任务，你会更倾向于？",
      "options": [
        {
          "text": "直接上手，边做边学",
          "scores": {
            "action": 3,
            "curiosity": 3,
            "adaptability": 2
          }
        },
        {
          "text": "先找资料，把框架弄清楚",
          "scores": {
            "rational": 3,
            "stability": 2,
            "curiosity": 1
          }
        },
        {
          "text": "找有经验的人请教",
          "scores": {
            "social": 2,
            "empathy": 2,
            "adaptability": 1
          }
        },
        {
          "text": "先自己研究，不想太依赖别人",
          "scores": {
            "independence": 3,
            "curiosity": 2
          }
        }
      ]
    },
    {
      "id": 6,
      "scene": "亲密关系",
      "question": "当你真正喜欢一个人时，你更可能？",
      "options": [
        {
          "text": "主动表达，让对方知道",
          "scores": {
            "action": 3,
            "emotional": 2,
            "social": 2
          }
        },
        {
          "text": "先观察对方态度，再决定",
          "scores": {
            "rational": 2,
            "emotional": 2,
            "stability": 2
          }
        },
        {
          "text": "用照顾和细节慢慢表达",
          "scores": {
            "empathy": 3,
            "emotional": 2,
            "stability": 1
          }
        },
        {
          "text": "保持自己的节奏，不急着定义关系",
          "scores": {
            "independence": 3,
            "adaptability": 1
          }
        }
      ]
    },
    {
      "id": 7,
      "scene": "生活习惯",
      "question": "周末突然多出半天空闲，你最可能？",
      "options": [
        {
          "text": "临时约人出去玩",
          "scores": {
            "social": 3,
            "curiosity": 2,
            "adaptability": 2
          }
        },
        {
          "text": "完成一直拖着的事情",
          "scores": {
            "stability": 3,
            "rational": 2,
            "action": 1
          }
        },
        {
          "text": "随便逛逛，看看会遇到什么",
          "scores": {
            "curiosity": 3,
            "adaptability": 3
          }
        },
        {
          "text": "一个人安静待着，恢复能量",
          "scores": {
            "independence": 3,
            "emotional": 1,
            "stability": 1
          }
        }
      ]
    },
    {
      "id": 8,
      "scene": "社交关系",
      "question": "朋友和你意见完全相反时，你通常会？",
      "options": [
        {
          "text": "直接辩到底，直到把观点说清",
          "scores": {
            "competitiveness": 3,
            "action": 2,
            "independence": 2
          }
        },
        {
          "text": "先听完，再讨论证据和逻辑",
          "scores": {
            "rational": 3,
            "empathy": 2
          }
        },
        {
          "text": "更在意关系，不想因为观点伤和气",
          "scores": {
            "empathy": 3,
            "stability": 2
          }
        },
        {
          "text": "接受彼此不同，没必要统一",
          "scores": {
            "independence": 3,
            "adaptability": 2
          }
        }
      ]
    },
    {
      "id": 9,
      "scene": "工作学习",
      "question": "团队里出现一个没人愿意接的难题，你会？",
      "options": [
        {
          "text": "如果我能做，就先站出来",
          "scores": {
            "action": 3,
            "competitiveness": 2,
            "independence": 1
          }
        },
        {
          "text": "先拆解问题，再分配任务",
          "scores": {
            "rational": 3,
            "stability": 2,
            "social": 1
          }
        },
        {
          "text": "先看看谁最需要帮助",
          "scores": {
            "empathy": 3,
            "social": 2
          }
        },
        {
          "text": "提出一个新办法，看看能不能绕过去",
          "scores": {
            "curiosity": 3,
            "adaptability": 3
          }
        }
      ]
    },
    {
      "id": 10,
      "scene": "情绪处理",
      "question": "压力很大时，你更常见的反应是？",
      "options": [
        {
          "text": "马上处理最棘手的事情",
          "scores": {
            "action": 3,
            "competitiveness": 2
          }
        },
        {
          "text": "把事情排序，逐项解决",
          "scores": {
            "rational": 3,
            "stability": 3
          }
        },
        {
          "text": "想找熟悉的人说一说",
          "scores": {
            "emotional": 2,
            "empathy": 2,
            "social": 2
          }
        },
        {
          "text": "先独处，让自己缓下来",
          "scores": {
            "independence": 3,
            "emotional": 2,
            "stability": 1
          }
        }
      ]
    },
    {
      "id": 11,
      "scene": "决策方式",
      "question": "如果一个选择“更稳妥”和“更有趣”不能兼得，你通常偏向？",
      "options": [
        {
          "text": "稳妥，确定性更重要",
          "scores": {
            "stability": 3,
            "rational": 2
          }
        },
        {
          "text": "有趣，难得的体验更重要",
          "scores": {
            "curiosity": 3,
            "adaptability": 2
          }
        },
        {
          "text": "看这次代价有多大再决定",
          "scores": {
            "rational": 3,
            "adaptability": 1
          }
        },
        {
          "text": "凭当时的感觉走",
          "scores": {
            "emotional": 3,
            "independence": 2
          }
        }
      ]
    },
    {
      "id": 12,
      "scene": "社交关系",
      "question": "朋友突然情绪低落，却说“我没事”，你会？",
      "options": [
        {
          "text": "直接问清楚发生了什么",
          "scores": {
            "action": 2,
            "empathy": 2,
            "social": 2
          }
        },
        {
          "text": "先陪着，不逼对方说",
          "scores": {
            "empathy": 3,
            "emotional": 2
          }
        },
        {
          "text": "给对方一些空间，等他主动开口",
          "scores": {
            "independence": 2,
            "empathy": 2,
            "stability": 1
          }
        },
        {
          "text": "帮他分析问题，想办法解决",
          "scores": {
            "rational": 3,
            "empathy": 1,
            "action": 1
          }
        }
      ]
    },
    {
      "id": 13,
      "scene": "极端情境",
      "question": "如果你发现大家都赞同一个你认为有问题的决定，你会？",
      "options": [
        {
          "text": "马上指出问题，即使会显得不合群",
          "scores": {
            "independence": 3,
            "action": 3,
            "competitiveness": 2
          }
        },
        {
          "text": "先收集证据，再选择合适时机提出",
          "scores": {
            "rational": 3,
            "stability": 2
          }
        },
        {
          "text": "先和少数信任的人确认观点",
          "scores": {
            "social": 2,
            "empathy": 2,
            "rational": 1
          }
        },
        {
          "text": "如果影响不大，就尊重多数意见",
          "scores": {
            "adaptability": 3,
            "empathy": 1
          }
        }
      ]
    },
    {
      "id": 14,
      "scene": "生活习惯",
      "question": "旅行时，你更喜欢哪种方式？",
      "options": [
        {
          "text": "把关键路线和时间提前规划好",
          "scores": {
            "stability": 3,
            "rational": 3
          }
        },
        {
          "text": "只定大方向，其他随缘",
          "scores": {
            "adaptability": 3,
            "curiosity": 2
          }
        },
        {
          "text": "去热门地方，和大家一起热闹",
          "scores": {
            "social": 3,
            "curiosity": 1
          }
        },
        {
          "text": "避开人群，按自己的节奏走",
          "scores": {
            "independence": 3,
            "curiosity": 2
          }
        }
      ]
    },
    {
      "id": 15,
      "scene": "亲密关系",
      "question": "关系中出现矛盾时，你最希望对方怎么做？",
      "options": [
        {
          "text": "把问题直接说清楚",
          "scores": {
            "action": 2,
            "rational": 2,
            "social": 1
          }
        },
        {
          "text": "先安抚情绪，再讨论问题",
          "scores": {
            "empathy": 3,
            "emotional": 3
          }
        },
        {
          "text": "给彼此一点时间冷静",
          "scores": {
            "independence": 2,
            "stability": 2
          }
        },
        {
          "text": "不要反复纠结，尽快翻篇",
          "scores": {
            "adaptability": 3,
            "action": 1
          }
        }
      ]
    },
    {
      "id": 16,
      "scene": "工作学习",
      "question": "完成一件事情时，什么最容易让你有成就感？",
      "options": [
        {
          "text": "比预期更快、更有效率",
          "scores": {
            "competitiveness": 3,
            "action": 2
          }
        },
        {
          "text": "过程井井有条，没有失控",
          "scores": {
            "stability": 3,
            "rational": 2
          }
        },
        {
          "text": "学到了以前不知道的东西",
          "scores": {
            "curiosity": 3,
            "adaptability": 1
          }
        },
        {
          "text": "结果真正帮到了别人",
          "scores": {
            "empathy": 3,
            "social": 1
          }
        }
      ]
    },
    {
      "id": 17,
      "scene": "情绪处理",
      "question": "你突然意识到自己做错了一件事，更可能？",
      "options": [
        {
          "text": "马上补救，先减少影响",
          "scores": {
            "action": 3,
            "adaptability": 2
          }
        },
        {
          "text": "复盘为什么会出错，避免再犯",
          "scores": {
            "rational": 3,
            "stability": 2
          }
        },
        {
          "text": "会自责一阵，担心别人怎么想",
          "scores": {
            "emotional": 3,
            "empathy": 2
          }
        },
        {
          "text": "承认错误，但不会一直否定自己",
          "scores": {
            "independence": 2,
            "adaptability": 3
          }
        }
      ]
    },
    {
      "id": 18,
      "scene": "社交关系",
      "question": "你更容易被哪种人吸引？",
      "options": [
        {
          "text": "行动果断、充满能量的人",
          "scores": {
            "action": 2,
            "competitiveness": 2,
            "social": 1
          }
        },
        {
          "text": "聪明、有逻辑、有想法的人",
          "scores": {
            "rational": 3,
            "curiosity": 2
          }
        },
        {
          "text": "温柔、会照顾别人感受的人",
          "scores": {
            "empathy": 3,
            "emotional": 2
          }
        },
        {
          "text": "独特、有自己世界的人",
          "scores": {
            "independence": 3,
            "curiosity": 2
          }
        }
      ]
    },
    {
      "id": 19,
      "scene": "生活习惯",
      "question": "面对一件重复但重要的事情，你通常？",
      "options": [
        {
          "text": "固定时间做，形成习惯",
          "scores": {
            "stability": 3,
            "rational": 2
          }
        },
        {
          "text": "尽快做完，不让它占脑子",
          "scores": {
            "action": 3,
            "competitiveness": 1
          }
        },
        {
          "text": "想办法换种做法，减少无聊",
          "scores": {
            "curiosity": 3,
            "adaptability": 2
          }
        },
        {
          "text": "状态好时集中处理，平时不强迫自己",
          "scores": {
            "independence": 2,
            "emotional": 1,
            "adaptability": 1
          }
        }
      ]
    },
    {
      "id": 20,
      "scene": "决策方式",
      "question": "别人对你的选择不太认可时，你更可能？",
      "options": [
        {
          "text": "如果我认定了，就继续做",
          "scores": {
            "independence": 3,
            "action": 2
          }
        },
        {
          "text": "重新检查自己的判断有没有漏洞",
          "scores": {
            "rational": 3,
            "adaptability": 1
          }
        },
        {
          "text": "会在意，但希望对方理解我",
          "scores": {
            "emotional": 2,
            "empathy": 2,
            "social": 1
          }
        },
        {
          "text": "根据反馈调整一部分方案",
          "scores": {
            "adaptability": 3,
            "rational": 1
          }
        }
      ]
    },
    {
      "id": 21,
      "scene": "极端情境",
      "question": "如果只有一次机会参加一项有风险但很特别的体验，你会？",
      "options": [
        {
          "text": "只要风险可控，我会去",
          "scores": {
            "curiosity": 3,
            "action": 3,
            "adaptability": 1
          }
        },
        {
          "text": "先把风险和收益研究清楚",
          "scores": {
            "rational": 3,
            "stability": 2
          }
        },
        {
          "text": "看有没有熟悉的人一起",
          "scores": {
            "social": 2,
            "empathy": 1,
            "stability": 1
          }
        },
        {
          "text": "大概率不去，我更重视安全感",
          "scores": {
            "stability": 3,
            "independence": 1
          }
        }
      ]
    },
    {
      "id": 22,
      "scene": "工作学习",
      "question": "当别人公开质疑你的能力时，你通常会？",
      "options": [
        {
          "text": "用结果证明给他看",
          "scores": {
            "competitiveness": 3,
            "action": 3
          }
        },
        {
          "text": "先判断对方说得有没有道理",
          "scores": {
            "rational": 3,
            "independence": 1
          }
        },
        {
          "text": "会受影响，但不愿当场表现出来",
          "scores": {
            "emotional": 3,
            "stability": 1
          }
        },
        {
          "text": "如果评价没价值，就不回应",
          "scores": {
            "independence": 3,
            "adaptability": 2
          }
        }
      ]
    },
    {
      "id": 23,
      "scene": "亲密关系",
      "question": "你更看重一段关系里的什么？",
      "options": [
        {
          "text": "彼此坦率，什么都能说",
          "scores": {
            "social": 2,
            "action": 1,
            "empathy": 2
          }
        },
        {
          "text": "稳定可靠，不轻易改变",
          "scores": {
            "stability": 3,
            "empathy": 2
          }
        },
        {
          "text": "精神共鸣，能理解彼此",
          "scores": {
            "emotional": 2,
            "empathy": 3,
            "curiosity": 1
          }
        },
        {
          "text": "尊重边界，各自保持空间",
          "scores": {
            "independence": 3,
            "rational": 1
          }
        }
      ]
    },
    {
      "id": 24,
      "scene": "情绪处理",
      "question": "当你心情不好，但还有事情必须完成时，你会？",
      "options": [
        {
          "text": "先做事，情绪之后再处理",
          "scores": {
            "action": 3,
            "stability": 2
          }
        },
        {
          "text": "分析自己为什么难受，理顺后再做",
          "scores": {
            "rational": 3,
            "emotional": 1
          }
        },
        {
          "text": "状态会明显影响效率",
          "scores": {
            "emotional": 3,
            "empathy": 1
          }
        },
        {
          "text": "换个环境或方式，让自己重新进入状态",
          "scores": {
            "adaptability": 3,
            "curiosity": 1
          }
        }
      ]
    },
    {
      "id": 25,
      "scene": "生活习惯",
      "question": "买一个价格不低但很喜欢的东西时，你更可能？",
      "options": [
        {
          "text": "喜欢很久了就直接买",
          "scores": {
            "action": 2,
            "emotional": 2,
            "independence": 2
          }
        },
        {
          "text": "比较参数、评价和价格后再决定",
          "scores": {
            "rational": 3,
            "stability": 2
          }
        },
        {
          "text": "问问身边用过的人",
          "scores": {
            "social": 2,
            "empathy": 1,
            "rational": 1
          }
        },
        {
          "text": "先放几天，如果还想要再买",
          "scores": {
            "stability": 3,
            "adaptability": 1
          }
        }
      ]
    },
    {
      "id": 26,
      "scene": "社交关系",
      "question": "如果你发现新认识的人和自己非常不同，你会？",
      "options": [
        {
          "text": "更想了解他为什么会这样想",
          "scores": {
            "curiosity": 3,
            "empathy": 2
          }
        },
        {
          "text": "先找共同点，看看能不能聊得来",
          "scores": {
            "social": 3,
            "adaptability": 2
          }
        },
        {
          "text": "保持礼貌，但不会刻意接近",
          "scores": {
            "independence": 2,
            "stability": 2
          }
        },
        {
          "text": "差异太大时，我会快速拉开距离",
          "scores": {
            "independence": 3,
            "rational": 1
          }
        }
      ]
    },
    {
      "id": 27,
      "scene": "工作学习",
      "question": "一个项目快结束时突然出现新想法，你通常会？",
      "options": [
        {
          "text": "如果明显更好，就改",
          "scores": {
            "curiosity": 2,
            "adaptability": 3,
            "action": 2
          }
        },
        {
          "text": "先算改动成本，再决定值不值",
          "scores": {
            "rational": 3,
            "stability": 2
          }
        },
        {
          "text": "宁愿先按原计划交付，下次再优化",
          "scores": {
            "stability": 3,
            "competitiveness": 1
          }
        },
        {
          "text": "和团队讨论，看大家是否愿意一起改",
          "scores": {
            "social": 2,
            "empathy": 2,
            "adaptability": 1
          }
        }
      ]
    },
    {
      "id": 28,
      "scene": "决策方式",
      "question": "你发现自己和过去的想法完全不同了，你会怎么看？",
      "options": [
        {
          "text": "很正常，人本来就会变化",
          "scores": {
            "adaptability": 3,
            "curiosity": 2
          }
        },
        {
          "text": "会回头分析是什么改变了我",
          "scores": {
            "rational": 3,
            "curiosity": 1
          }
        },
        {
          "text": "如果新的想法更符合自己，就接受",
          "scores": {
            "independence": 3,
            "adaptability": 2
          }
        },
        {
          "text": "多少会有点不安，希望保持连续性",
          "scores": {
            "stability": 3,
            "emotional": 2
          }
        }
      ]
    },
    {
      "id": 29,
      "scene": "亲密关系",
      "question": "你最难接受关系中的哪一种情况？",
      "options": [
        {
          "text": "冷处理，有问题却不说",
          "scores": {
            "action": 2,
            "social": 2,
            "emotional": 1
          }
        },
        {
          "text": "反复失信，让人没有安全感",
          "scores": {
            "stability": 3,
            "empathy": 2
          }
        },
        {
          "text": "控制太多，不尊重个人空间",
          "scores": {
            "independence": 3,
            "competitiveness": 1
          }
        },
        {
          "text": "永远没有新鲜感，像在重复同一天",
          "scores": {
            "curiosity": 3,
            "adaptability": 2
          }
        }
      ]
    },
    {
      "id": 30,
      "scene": "极端情境",
      "question": "如果明天开始必须在“稳定但普通”和“未知但可能精彩”之间选一种生活，你更偏向？",
      "options": [
        {
          "text": "稳定但普通，我更重视确定性",
          "scores": {
            "stability": 3,
            "rational": 2
          }
        },
        {
          "text": "未知但精彩，我愿意承担变化",
          "scores": {
            "curiosity": 3,
            "adaptability": 3,
            "action": 2
          }
        },
        {
          "text": "我会先争取一个折中方案",
          "scores": {
            "rational": 2,
            "adaptability": 2,
            "independence": 1
          }
        },
        {
          "text": "取决于我当时最在乎的人和事",
          "scores": {
            "emotional": 2,
            "empathy": 3
          }
        }
      ]
    }
  ]
}
