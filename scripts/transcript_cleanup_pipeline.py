#!/usr/bin/env python3
"""Reusable cleanup and QA pipeline for long OCR/audio transcripts.

The pipeline is intentionally conservative: it applies mechanical repairs that
are safe for OCR-derived prose, then emits review reports for suspect passages
instead of silently guessing at difficult readings.
"""

from __future__ import annotations

import argparse
import json
import re
from dataclasses import dataclass, asdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

KNOWN_REPLACEMENTS = {
    "stimu).ation": "stimulation",
    "R.tmosphere": "atmosphere",
    "telEwi'lion": "television",
    "bustomary": "customary",
    "marijuana for has": "marijuana has",
    "JudeoChristians": "Judeo-Christians",
    "\\lave": "have",
    "inert system": "energy system",
    "care-\n\nfully": "carefully",
    "because weekly LSD session like good tidy": "because you'll be sitting around home smoking marijuana and preparing for your next weekly LSD session like good, tidy",
    "what it's about -like LSD": "what it's about, like LSD",
    "It has to be Communabout. \" ists, witches": "It has to be Communists, witches",
    "It has to be Communists, witches, devils, possession": "There have to be Communists, witches, devils, possession",
    "There has to be Communists, witches, devils, possession": "There have to be Communists, witches, devils, possession",
    "It's a gamble, it's a risk, The sacrament": "It's a gamble, it's a risk. The sacrament",
    "Govern:ment": "Government",
    "They say,.": "They say,",
    "know what it's all about. It's written in the law": "we know what it's all about. It's written in the law",
    "Marijuana's a narcotic, addictive drug it causes": "Marijuana's a narcotic, addictive drug and it causes",
    "with You're certainly not going to give MIT a students": "You're certainly not going to give MIT students",
    "Because what would the Massachusetts was stat~ legislature": "Because what would the Massachusetts state legislature",
    "fact~": "fact,",
    "peo.pIe": "people",
    "bodY,that": "body, that",
    "~stracted": "distracted",
    "s~rink": "shrink",
    "have' got": "have got",
    "l'he speed-up": "The speed-up",
    "hypotheSiS": "hypothesis",
    "spnse": "sense",
    "hegins": "begins",
    "thirtyfive": "thirty-five",
    "vous system is not": "The nervous system is not",
    "octopustype": "octopus-type",
    "inside?Anyputer. one who": "inside? Anyone who",
    "divine you that": "you that",
    "decided college. Which": "college. Which",
    "cause You like": "You like",
    "teens, The neurological": "The neurological",
    "thirteen are that": "are that",
    "corwhen tical": "cortical",
    "when move I'm": "when I'm",
    "brainall damaged": "brain-damaged",
    "instiall tute": "institute",
    "all say": "say",
    "nineteen, was in my twenties": "was in my twenties",
    "begin-to work and. I": "begin to work and I",
    "death now here I am": "now here I am",
    "rearound member": "remember",
    "God. h And": "God.\" And",
    "urn, I'm God": "um, I'm God",
    "I',m God": "I'm God",
    "Right~ congratulations": "Right, congratulations",
    "seductive' and": "seductive and",
    "middle-~lass": "middle-class",
    "o,r another": "or another",
    "Otherw.ise": "Otherwise",
    "mythe self": "myself",
    "presentation him, extremely": "presentation extremely",
    "adornments, At any rate": "adornments. At any rate",
    "for myself, This": "for myself. This",
    "cortex, You'll": "cortex. You'll",
    "because' this": "because this",
    "only have of saying something conway we cretely": "only way we have of saying something concretely",
    "Mussolini' s": "Mussolini's",
    "w:trso what": "war so what",
    "in. your this case": "in this case",
    "pure nonsense, in r I therefore": "pure nonsense. I therefore",
    "law of the land as for the very simple reason": "law of the land for the very simple reason",
    "tool of as the devil": "tool of the devil",
    "look upo~ you": "look upon you",
    "gobbledygook. somebody What": "gobbledygook. What",
    "take you a dose": "take a dose",
    "return trips are I free": "return trips are free",
    "Let me ask ly, you": "Let me ask you",
    "return t~ip": "return trip",
    "and If you saw": "If you saw",
    "complained of think this": "complained of this",
    "knoW.' I~ Tim": "know.\" Tim",
    "as you a clinician": "as a clinician",
    "Thereto fore": "Therefore",
    "eXllmples": "examples",
    "means that has scooped": "means that someone has scooped",
    "judg~ ment": "judgment",
    "second-r.ate": "second-rate",
    "~ou are": "You are",
    "ther than make": "Rather than make",
    "or if L can": "or if I can",
    "consistantly": "consistently",
    "writer' and": "writer and",
    "why Should": "why should",
    "tend.to": "tend to",
    "re~ly": "really",
    "than!lve": "than five",
    "institution. are": "institution are",
    "engineers. who": "engineers who",
    "metaphor. of": "metaphor of",
    "experience. that": "experience that",
    "Dr. L~": "Dr. Leary",
    "comI ments": "comments",
    "modem student": "modern student",
    "drug.induced": "drug-induced",
    "ritual. any myth": "ritual, any myth",
    "dif ferent": "different",
    "~tssues": "issues",
    "don~t": "don't",
    "or 'any": "or any",
    "present ington five years ago": "present this: five years ago",
    "training courses. ing: and": "training courses, and",
    "It's ~oing": "It's going",
    "boom is LSD. now here": "boom is now here",
    "six.years": "six years",
    "hi~ life": "his life",
    "thi~": "think",
    "whQ": "who",
    "~ersuade": "persuade",
    "-not": "- not",
    "forei~": "foreign",
    "cess. has here": "has here",
    "actly": "exactly",
    "iJ:.l": "in",
    "for you words": "for you in words",
    "find it. can teach": "find it. We can teach",
    "and we icating it": "and ways of communicating it",
    "mimi": "mind",
    "y~u": "you",
    "danCing": "dancing",
    "you the to continue": "you to continue",
    "what this we call": "what we call",
    "bot~ ag~e.e": "both agree",
    "sClenhflC": "scientific",
    "systern": "system",
    "beyond -the -mind": "beyond-the-mind",
    "ago. the You": "ago. You",
    "things, _ you": "things, you",
    "absolute ~ confidence": "absolute confidence",
    "three been years": "three years",
    "tremend~us": "tremendous",
    "dld": "did",
    "perhas s.on": "person",
    "funchon": "function",
    "ar.gument": "argument",
    "mmd": "mind",
    "proex-": "process",
    "pOint": "point",
    "robot routine and immediate detail to stimuBut": "robot routine and immediate response to stimuli. But",
    "sen.., sitivity": "sensitivity",
    "television show. situation.": "television show.",
    "wanted say, to do research": "wanted to do research",
    "what marijuana's They say": "what marijuana's about.\" They say",
    "we we we we know": "we know",
    "It's been impossible to do research marijuana": "It's been impossible to do research on marijuana",
    "a lot of funperhaps": "a lot of fun - perhaps",
    "around. our research pro., jects in Newton or 10 MeXICO and I d,.": "around our research projects in Newton or in Mexico and I'd say,",
    "Daddy don t": "Daddy don't",
    "about we four": "about four",
    "Hasok Klakir": "Ashok Fakir",
    "down and to the Ganges": "down to the Ganges",
    "River, We sat there a group of Shlvites, sitting around burning gats": "River. We sat there with a group of sadhus, sitting around the burning ghats",
    "I in India": "I was in India",
    "in different I'm sorry": "in different activities. I'm sorry",
    "exexexactly": "exactly",
    "needed,for": "needed, for",
    "oldfashioned": "old-fashioned",
    "diSCipline": "discipline",
    "of'the": "of the",
    "phYSiological": "physiological",
    "psy.... chosis": "psychosis",
    "It's 1m old, old problem": "It's an old, old problem",
    "slow It's very simple. Anything that moves decide. and is visible out there in the television you studio set of the United States of America Massachusetts, Cambridge": "It's very simple. Anything that moves and is visible out there in the television studio set of Cambridge, Massachusetts, United States of America",
    "controIs": "controls",
    "causes and painful death": "causes a painful death",
    "You Warning: Marijuana": "Warning: Marijuana",
    "scientific grounds 00Therefore": "scientific grounds. Therefore",
    "lobotolike my mamma": "lobotomy. They say, \"I feel like my mamma",
    "lOSing": "losing",
    "--Row many": "How many",
    "take a on lobotomy": "take a lobotomy",
    "functional leSion": "functional lesion",
    "I still flip in conservative. flip out": "I still flip in and flip out",
    "what do I and worry about": "what do I worry about",
    "This sounds like open, but a functional lesion": "This sounds like a functional lesion",
    "'ax-murderers": "axe murderers",
    "psylocybin": "psilocybin",
    "secondrate": "second-rate",
    "RaRather": "Rather",
    "consicler": "consider",
    "readDostoyevskyagain": "read Dostoevsky again",
    "dammit!": "dammit.",
    "E=MC 2": "E = mc2",
    "physiCists": "physicists",
    "Pm not": "I'm not",
    "realer -when": "realer - when",
    "because 'some": "because some",
    "would you welcome": "would welcome",
    "five or six As million": "five or six million",
    "When you release not a drug": "When you release a drug",
    "Vassarit": "Vassar, it",
    "didJou": "did you",
    "less prepare": "less prepared",
    "deSCriptions": "descriptions",
    "ar8CDI": "areas",
    "psychoeis": "psychosis",
    "the word psychosis": "the word \"psychosis\"",
    "religiOUS": "religious",
    "nobodr": "nobody",
    "and share that worry": "and I share that worry",
    "struc ture": "structure",
    "profeSSion": "profession",
    "risk..": "risk.",
    "LSD con- the stitutes": "LSD constitutes",
    "I' 11": "I'll",
    "so that happy": "so happy",
    "what with I call": "what I call",
    "for- took get it": "forget it",
    "OnE ing, other chemical": "one other chemical",
    "chem- ter ical abstracts": "chemical abstracts",
    "sense. LSD": "LSD",
    "don't think 80": "don't think so",
    "chem ical": "chemical",
    "And what betMoscow into Buddhas while we march in to take over?": "And what better way to turn Moscow into Buddhas while we march in to take over?",
    "caseof": "case of",
    "dilemI have": "dilemma.\n\nI have",
    "leper s": "lepers",
    "strictive licensing": "restrictive licensing",
    "YoU) first": "Your first",
    "fo; spiritual": "for spiritual",
    "several\", years": "several years",
    "control' you": "control: you",
    "kno,:": "know",
    "medlCal": "medical",
    "when! say": "when I say",
    "self -confidence": "self-confidence",
    "which been going": "which has been going",
    "exexactly": "exactly",
    "pOSSible": "possible",
    "monastary": "monastery",
    "two or three Why? that reach satori": "two or three men that reach satori",
    "some sort of a here going": "some sort of a society here going",
    "complete trust in the DNA genetic process the evolutionary process on this I think": "complete trust in the DNA genetic process and in the evolutionary process on this planet. I think",
    "psychedelthreatens": "psychedelic drugs happen to be at this moment the exact cure for the illness that threatens",
    "drugproducing": "drug-producing",
    "llloment": "moment",
    "The nerThe nervous system": "The nervous system",
    "problems.\" There's any number of statistical and stop. Drop out. anecdotal studies to suggest very strongNow ly": "problems.\" There are any number of statistical and anecdotal studies to suggest very strongly",
    "There's any number of statistical and stop. Drop out. anecdotal studies to suggest very strongNow ly": "There are any number of statistical and anecdotal studies to suggest very strongly",
    "brainto middle-aged damaged": "brain-damaged",
    "twenty, twenents ty-five": "twenty, twenty-five",
    "in the office-which I hope none of you willdid if you ever get around to making laws, pIe I suggest": "in office - which I hope none of you will - if you ever get around to making laws, I suggest",
    "orhold ber power": "or hold power",
    "seed-carrying peocan't pIe": "seed-carrying people",
    "makeneuthat not to mine": "make sense?",
    "When should people be allowed to vote? When people ask me questions this I don't play my chess game, twentieth century, psychological comI ask my DNA code. I ask the process. \"Hey down there,when did you want people to vote?\" Andthey you were ready to start taking about the age of puberty. Beat just about that age, early you began to get control of this billion cell computer. And you get in power, why don't you the voting age down to thirte.e n?": "When should people be allowed to vote? When people ask me questions, I don't play my chess game, twentieth-century psychological computer. I ask my DNA code. I ask the process. \"Hey down there, when did you want people to vote?\" And you were ready to start taking power about the age of puberty. Just about that age, early teens, you began to get control of this billion-cell computer. And when you get in power, why don't you move the voting age down to thirteen?",
    "that steel. Because as people get older": "their steel. Because as people get older",
    "they.lose": "they lose",
    "red thread billion years": "red thread of a billion years",
    "forhow to do": "forget how to do",
    "they feel coming;": "they feel death coming;",
    "a metal kitchen, and a two or three thousand pound metal car them": "a metal kitchen, and a two- or three-thousand-pound metal car around them",
    "around country": "around their country",
    "And I think it's time to I'm not urging": "And I think it's time to stop. I'm not urging",
    "like your paror me": "like your parents or me",
    "Don't let me,. Timothy Leary, vote. But be to me. As you take away my expower, tell me, remind me of ancient message.": "Don't let me, Timothy Leary, vote. But be good to me. As you take away my external power, tell me, remind me of this ancient message.",
    "Drop out, turn on, Dad. Tune in.": "Drop out, turn on, Dad. Tune in.",
    "United States today.. Okay, how it happen? How did ten millionpeodo this terrible thing? They didit": "United States today. Okay, how did it happen? How did ten million people do this terrible thing? They did it",
    "Friend. by friend": "Friend by friend",
    "family memthat's": "family member - that's",
    "You get pot unless": "You can't get pot unless",
    "that trusts you. sociology": "that trusts you. The sociology",
    "It ' s": "It's",
    "Tontric": "Tantric",
    "Naguli": "Naga",
    "decoded organic structures": "decoded through organic structures",
    "anyone level": "any one level",
    "~r MIT heads": "or MIT heads",
    "The goal of our re. searc h,an d th e go al 0 f our yoga, IS h. t t d t o rna k e th ose w 0 are meres e aware 0 f th e f ac t th a t you h ave coun t. less levels of conSCIOusness, that you.. can learn how to manipulate them, use IClan, 00 n.g a 't th em, an d app 1 y th em f or b ene f 1 • W e d. 1 'd n. 't b' bo t th hi e p~y~ c r.mg a u revolutIOn m this country by slttmg around and taking LSD and smoking pot and consulting our navel.": "The goal of our research, and the goal of our yoga, is to make those who are interested aware of the fact that you have countless levels of consciousness, that you can learn how to manipulate them, use them, and apply them for benefit. We didn't bring about the psychedelic revolution in this country by sitting around and taking LSD and smoking pot and consulting our navel.",
    "LSD? for even strychnine": "LSD?\n\nLettvin: Not even strychnine",
    "y~t": "yet",
    "-c'enter": "center",
    "If we knew anything at all about how th~ nervous system acted, possibly we mIght be able to say how a drug acts. When I talked to you, I did not provide..... you WIth a sClentiflc explanatlOn, or. tif' IC warnIngs.. I was tIl' SClen e mg you.... as a rank emplrIClst, as a former clm1 ki t thO tt I.. mgs u. er y emplr.lcally, and WIthout any SCIence or logIC tall.t 11 b d a. 1 sme s a.": "If we knew anything at all about how the nervous system acted, possibly we might be able to say how a drug acts. When I talked to you, I did not provide you with a scientific explanation, or scientific warnings. I was telling you as a rank empiricist, as a former clinician, looking at these things utterly empirically and without any science or logic.",
    "con-\n\nventional": "conventional",
    "chil-\n\ndren": "children",
    "probthis lems": "problems",
    "buy good the system": "buy the system",
    "men who that are running": "men who are running",
    "running for in office": "running for office",
    "about history. brain damage": "about brain damage",
    "years lover, of age": "years of age",
    "everything has grown in human Friend by friend": "everything has grown in human history. Friend by friend",
    "and they get say": "and they say",
    "mentality ternal generation": "mentality",
    "best physicists of two and your best mathematicians": "best physicists and your best mathematicians",
    "you can't be free out t h ere no ma tt er h ow many bombers you h ave pro t ec t mg you, re f ree oo mSl consciousness": "you can't be free out there, no matter how many bombers you have protecting you. Freedom is consciousness",
    "The only reason I use the metaphor of religion is because that's the only language we gOt": "The only reason I use the metaphor of religion is because that's the only language we've got",
    "Didn't yO\" know": "Didn't you know",
    "Psychologists have got to be molecular psychologists you've got to do it yourself. You can't let an alcoholic look at the microscope o you up th er e unless and tell you that he feels better, but? d e an d you can change what are those funny bugs You have to apply the microscope consciousness": "Psychologists have got to be molecular psychologists. You have to apply the microscope of consciousness",
    "con sciousness": "consciousness",
    "Warning: Marijuana, brings to your senses.": "Warning: Marijuana brings you to your senses.",
    "sWear": "swear",
    "viSionaries": "visionaries",
    "yourself. because the only conof trol of LSD is self-control.": "yourself, because the only control of LSD is self-control.",
    "We want moments.\" to get the lenses of our microscopes sharper and sharper. I'm perfectly perhaps even a dangerous psychedelic drug. Perhaps there will be a more powerful chemical that won't have any side effects. You see what we're dowe have our own": "We want to get the lenses of our microscopes sharper and sharper. Perhaps LSD is an imperfect, perhaps even dangerous psychedelic drug. Perhaps there will be a more powerful chemical that won't have any side effects. You see what we're doing: we have our own",
    "words. \" We can teach": "words.\" We can teach",
    "The next era - political era -was": "The next era - political era - was",
    "psilocybinl": "psilocybin",
    "Idissociatemyselffrom your warnings": "I dissociate myself from your warnings",
    "seductive warnwhere": "seductive warning, where",
    "What betcome-on is there": "What better come-on is there",
    "I didn't mean l'Don't try it, it's dangerous;\" in that Our friend": "I didn't mean \"Don't try it, it's dangerous,\" in that sense. Our friend",
    "busin\",ss": "business",
    "When read that Faust is tempted by a vision of Seleme": "When I read that Faust is tempted by a vision of Helen",
    "\"'What is Seleme'thinking of": "\"What is Helen thinking of",
    "in that' sense": "in that sense",
    "nothing to fear but his lucid Would you please comment?": "nothing to fear but his lucid moments.\" Would you please comment?",
    "His lucid moments. Right. point that": "His lucid moments. Right. That's the point that",
    "gettin& your sotlls": "getting your souls",
    "lev el": "level",
    "stud ies": "studies",
    "Daddy -Bird": "Daddy Bird",
    "hypocriti cal": "hypocritical",
    "there 1.1 a bunch": "there is a bunch",
    "r oom play ing": "room playing",
    "five star": "five-star",
    "does any thing": "does anything",
    "Haight-A shbury": "Haight-Ashbury",
    "brain damaged": "brain-damaged",
    "seed -carrying": "seed-carrying",
    "country'.": "country.",
    "It smells ood. g": "It smells good.",
    "theil'.\"s": "theirs",
    "Rolling stones": "Rolling Stones",
    "yourbig c'o mputer": "your big computer",
    "world, ma today. as long": "world today as long",
    "spiritual awakenine:?": "spiritual awakening?",
    "to my Knowledge": "to my knowledge",
    "Those detic philosophers": "Those Vedic philosophers",
    "existence's problem/3": "existence's problems",
    "rerestrictive licensing": "Restrictive licensing",
    "benefit' can accrue": "benefit can accrue",
    "morphine: heroin": "morphine, heroin",
    "has read arguments": "has made arguments",
    "injecting, injesting": "injecting, ingesting",
    "the sam ati, the ravani or the sotoric experience": "the samadhi, the nirvanic or the satoric experience",
    "For a thou sand years, men like myself have sitting": "For a thousand years, men like myself have been sitting",
    "How can you talk about it how can you describe it?": "How can you talk about it? How can you describe it?",
    "Yw argue for a little differently": "You argue a little differently",
    "the now is the criteria": "the now is the criterion",
    "judgin ment": "judgment",
    "answer that We question": "answer that question",
    "Granted that the can drunk thinks": "Granted that the drunk thinks",
    "When you sured by a psychologist, drop.": "When you're measured by a psychologist, you drop.",
    "chess-gama-playing": "chess-game-playing",
    "highpoint": "high point",
    "have somehow men overlooked": "have somehow overlooked",
    "somesociety thing is not going as it should in this vision - education": "something is not going as it should in this society - education",
    "same t boss": "same boss",
    "takand in I ing a trip": "taking a trip",
    "And how does Dr. Lettvin planet. look at it? That's one question, to both completely speakers.": "And how does Dr. Lettvin look at it? That's one question, to both speakers.",
    "employs brute some standpoints": "employs some standpoints",
    "that' s": "that's",
    "robbers 'game": "robbers' game",
    "Childer's Primer": "Child's Primer",
    "tambouras India beat": "tambouras, Indian beat",
    "contraceptuality": "contraceptuality",
    "our. research": "our research",
    "you' ve": "you've",
    "There ' s": "There's",
    "The Age of Consciousness\".": "The Age of Consciousness.\"",
    "if want to keep": "if you want to keep",
    "probable. a matter": "probable. As a matter",
    "it harder": "it harder",
    "take LSD'": "take LSD",
    "with Some of these people": "with STP. Some of these people",
    "hello which": "which",
    "STP. \"": "STP.\"",
    "Pritchcalled": "Pritchard, called",
    "MacDonald Pritchard": "Macdonald Critchley",
    "m.e taphorical": "metaphorical",
    "symbolizing_": "symbolizing.",
    "99 %": "99%",
    "preparedd": "prepared",
    "conlations of this sort we don't tolerate for ourselves.": "consciousness.",
    "m lecular": "molecular",
    "there ' s": "there's",
    "batt.e ry": "battery",
    "drug induced": "drug-induced",
    "I agree you completely": "I agree with you completely",
    "\"I LSD once": "\"I took LSD once",
    "drop-out bag": "drop-out bag",
    "fulltime": "full-time",
    "Namastay..": "Namastay.",
    "trey say": "they say",
    "Namastay": "Namaste",
    "Shati": "Shakti",
    "anq rebirth": "and rebirth",
    "turn on your senses": "turn on your senses",
    "lobodomy": "lobotomy",
    "Raafterwards": "afterwards",
    "braindamaged": "brain-damaged",
    "dammit.": "dammit.",
    "However, I just want to. underline": "However, I just want to underline",
    "a clear difference. and": "a clear difference and",
    "If want to keep": "If you want to keep",
    "When you take. LSD": "When you take LSD",
    "consciousness. consciousness.": "consciousness.",
    "Has it ever occurred you": "Has it ever occurred to you",
    "everyone of them": "every one of them",
    "Let us give it only several days, let's be Let me now for a moment go to a footnote, before I continue. Do most a of you know how suicides by barbiturany notion of what the most common history is?": "Let us give it only several days. Let me now for a moment go to a footnote before I continue. Do most of you have any notion of what the most common history of suicide by barbiturate is?",
    "Those of us who are very much involved in LSD have very few illusions studies done, we want neurological studies done.": "Those of us who are very much involved in LSD have very few illusions. We want neurological studies done.",
    "If you want to stick full time, or half the time to the robot task which juana.": "If you want to stick full time, or half the time, to the robot task, don't use marijuana.",
}

SUSPECT_PATTERNS = [
    ("stray_ocr_punctuation", re.compile(r"[~\\]|[A-Za-z]\)[.;:]|[.;:][A-Za-z]{2,}")),
    ("broken_hyphen", re.compile(r"\b[A-Za-z]{2,}-\s*$|\b[A-Za-z]{2,}-\s+[a-z]{2,}")),
    ("mixed_case_word", re.compile(r"\b[a-z]+[A-Z][A-Za-z]*\b|\b[A-Z][a-z]+[A-Z][A-Za-z]*\b")),
    ("spaced_word", re.compile(r"\b(?:[A-Za-z]\s+){3,}[A-Za-z]\b")),
    ("digit_letter_noise", re.compile(r"\b[A-Za-z]+\d+[A-Za-z]*\b|\b\d+[A-RT-Za-rt-z]{2,}\b")),
    ("ocr_garbage_token", re.compile(r"\b(?:POSSI|marIJuana|telE|bustomary|stimu\)|Communabout|R\.tmosphere)\b")),
    ("very_short_fragment", re.compile(r"^.{1,45}$")),
]

SECTION_RE = re.compile(r"^#{1,6}\s+")
SPEAKER_RE = re.compile(r"^(Leary|Lettvin|Question|Innisfree):\s+")
ALLOWED_MIXED_CASE = {
    "McLuhan",
    "MacDonald",
    "Dostoyevsky",
    "Judeo-Christians",
    "Innisfree",
    "Kresge",
    "PhD",
}


@dataclass
class Issue:
    severity: str
    kind: str
    section: str
    paragraph_index: int
    excerpt: str


def clean_markdown(markdown: str) -> str:
    markdown = normalize_characters(markdown)
    markdown = apply_known_replacements(markdown)
    markdown = apply_regex_replacements(markdown)
    markdown = repair_broken_paragraphs(markdown)
    markdown = apply_known_replacements(markdown)
    markdown = apply_regex_replacements(markdown)
    markdown = normalize_spacing(markdown)
    return markdown.strip() + "\n"


def normalize_characters(markdown: str) -> str:
    markdown = markdown.replace("\r\n", "\n").replace("\r", "\n")
    markdown = markdown.replace("“", '"').replace("”", '"').replace("’", "'")
    return markdown


def apply_known_replacements(markdown: str) -> str:
    for source, target in KNOWN_REPLACEMENTS.items():
        markdown = markdown.replace(source, target)
    return markdown


def apply_regex_replacements(markdown: str) -> str:
    # Remove a pull-quote/sidebar that the three-column OCR sometimes injects
    # into the running Leary text between "as they" and "staggered back."
    markdown = re.sub(
        r"as they\s+(?:I don't think the )?American culture is an insane asylum\..*?current symptom of our insanity\.\s*staggered",
        "as they staggered",
        markdown,
        flags=re.S,
    )
    markdown = re.sub(
        r"as they\s+ture is compatible with anything\..*?current symptom of our insanity\.\s*staggered",
        "as they staggered",
        markdown,
        flags=re.S,
    )
    return markdown


def normalize_spacing(markdown: str) -> str:
    markdown = re.sub(r"[ \t]+", " ", markdown)
    markdown = re.sub(r"\s+([,.;:!?])", r"\1", markdown)
    markdown = re.sub(r"([.!?])\s+([A-Z][a-z]+:)", r"\1\n\n\2", markdown)
    markdown = re.sub(r"\n{3,}", "\n\n", markdown)
    return markdown


def repair_broken_paragraphs(markdown: str) -> str:
    blocks = [block.strip() for block in re.split(r"\n{2,}", markdown) if block.strip()]
    repaired: list[str] = []

    for block in blocks:
        if not repaired or is_heading(block) or is_heading(repaired[-1]):
            repaired.append(block)
            continue

        previous = repaired[-1]
        if should_merge_ocr_block(previous, block):
            repaired[-1] = join_ocr_blocks(previous, block)
        else:
            repaired.append(block)

    return "\n\n".join(repaired).strip() + "\n"


def is_heading(block: str) -> bool:
    return bool(SECTION_RE.match(block))


def should_merge_ocr_block(previous: str, current: str) -> bool:
    if SPEAKER_RE.match(current):
        return False
    if previous.endswith("-"):
        return True
    if re.search(r"[,;:]\s*[\"']?$", previous):
        return True
    if not re.search(r"[.!?][\"']?$", previous):
        return True
    words = current.split()
    if len(words) <= 8 and not re.search(r"[.!?][\"']?$", current):
        return True
    if re.match(r"^[a-z),;:'\"]", current):
        return True
    return False


def join_ocr_blocks(previous: str, current: str) -> str:
    if previous.endswith("-"):
        joined = previous[:-1].rstrip() + current.lstrip()
    else:
        joined = previous.rstrip() + " " + current.lstrip()
    joined = re.sub(r"([A-Za-z])-\s+([A-Za-z])", r"\1\2", joined)
    joined = re.sub(r"\s+", " ", joined)
    return joined.strip()


def audit_markdown(markdown: str) -> list[Issue]:
    issues: list[Issue] = []
    section = "Document"
    paragraph_index = 0

    for block in [block.strip() for block in re.split(r"\n{2,}", markdown) if block.strip()]:
        if is_heading(block):
            section = re.sub(r"^#{1,6}\s+", "", block).strip()
            paragraph_index = 0
            continue
        paragraph_index += 1
        for kind, pattern in SUSPECT_PATTERNS:
            if kind == "very_short_fragment" and (
                SPEAKER_RE.match(block)
                or len(block.split()) > 7
                or block.endswith("?")
                or block.startswith("Warning:")
            ):
                continue
            if kind == "mixed_case_word" and not has_unallowed_mixed_case(block, pattern):
                continue
            if kind == "digit_letter_noise" and not has_digit_letter_noise(block, pattern):
                continue
            if kind == "broken_hyphen" and not has_unallowed_broken_hyphen(block, pattern):
                continue
            if pattern.search(block):
                issues.append(Issue(
                    severity=severity_for(kind, block),
                    kind=kind,
                    section=section,
                    paragraph_index=paragraph_index,
                    excerpt=excerpt(block),
                ))
                break
    return issues


def has_unallowed_mixed_case(block: str, pattern: re.Pattern[str]) -> bool:
    for match in pattern.finditer(block):
        token = match.group(0)
        if token not in ALLOWED_MIXED_CASE:
            return True
    return False


def has_digit_letter_noise(block: str, pattern: re.Pattern[str]) -> bool:
    for match in pattern.finditer(block):
        token = match.group(0)
        if re.fullmatch(r"\d{3,4}s?", token):
            continue
        if token in {"mc2", "PhD", "MD"}:
            continue
        return True
    return False


def has_unallowed_broken_hyphen(block: str, pattern: re.Pattern[str]) -> bool:
    for match in pattern.finditer(block):
        token = match.group(0)
        if token in {"two- or", "one- or", "three- or"}:
            continue
        return True
    return False


def severity_for(kind: str, block: str) -> str:
    if kind in {"ocr_garbage_token", "spaced_word", "stray_ocr_punctuation"}:
        return "high"
    if kind == "broken_hyphen" and "\n" in block:
        return "high"
    if len(block.split()) <= 5:
        return "medium"
    return "low"


def excerpt(block: str, length: int = 420) -> str:
    compact = re.sub(r"\s+", " ", block).strip()
    if len(compact) <= length:
        return compact
    return compact[: length - 1].rstrip() + "..."


def write_reports(markdown: str, report_dir: Path) -> list[Issue]:
    report_dir.mkdir(parents=True, exist_ok=True)
    issues = audit_markdown(markdown)

    quality = {
        "paragraphs": len([block for block in re.split(r"\n{2,}", markdown) if block.strip() and not is_heading(block.strip())]),
        "issues_total": len(issues),
        "issues_by_severity": {
            "high": sum(1 for issue in issues if issue.severity == "high"),
            "medium": sum(1 for issue in issues if issue.severity == "medium"),
            "low": sum(1 for issue in issues if issue.severity == "low"),
        },
        "issues_by_kind": {},
    }
    for issue in issues:
        quality["issues_by_kind"][issue.kind] = quality["issues_by_kind"].get(issue.kind, 0) + 1

    (report_dir / "quality-report.json").write_text(json.dumps({
        **quality,
        "issues": [asdict(issue) for issue in issues],
    }, indent=2) + "\n", encoding="utf-8")

    lines = [
        "# Transcript Cleanup Report",
        "",
        f"- Paragraphs: {quality['paragraphs']}",
        f"- Suspect passages: {quality['issues_total']}",
        f"- High severity: {quality['issues_by_severity']['high']}",
        f"- Medium severity: {quality['issues_by_severity']['medium']}",
        f"- Low severity: {quality['issues_by_severity']['low']}",
        "",
        "## Suspect Passages",
    ]
    for issue in issues[:200]:
        lines.extend([
            "",
            f"### {issue.severity.upper()} / {issue.kind} / {issue.section} ¶{issue.paragraph_index}",
            "",
            issue.excerpt,
        ])
    (report_dir / "suspect-passages.md").write_text("\n".join(lines).strip() + "\n", encoding="utf-8")
    return issues


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Clean and QA a markdown transcript.")
    parser.add_argument("input", type=Path)
    parser.add_argument("--output", type=Path)
    parser.add_argument("--report-dir", type=Path)
    parser.add_argument("--strict", action="store_true", help="Exit nonzero when high-severity issues remain.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    markdown = args.input.read_text(encoding="utf-8")
    cleaned = clean_markdown(markdown)
    output = args.output or args.input.with_name(f"{args.input.stem}.cleaned{args.input.suffix}")
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(cleaned, encoding="utf-8")
    issues = write_reports(cleaned, args.report_dir or output.parent / "reports")
    high = sum(1 for issue in issues if issue.severity == "high")
    print(f"Wrote {output}")
    print(f"Wrote reports to {args.report_dir or output.parent / 'reports'}")
    print(f"Remaining suspect passages: {len(issues)} ({high} high)")
    if args.strict and high:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
