<?php

// Ranges of groups to EVEN consider and act upon
// 0 - Developer
// 1 - President
// 2-99 --> CUSTOM
// 100 - Student
// 255 - Unassigned

abstract class Query {
	const ACCESS_LEVEL_MIN = 0;
	const ACCESS_LEVEL_MAX = 256;
	const DEFAULT_COUNT = 10;
};
abstract class Modify {
	const ACCESS_LEVEL_MIN = 1;
	const ACCESS_LEVEL_MAX = 99;
};
?>